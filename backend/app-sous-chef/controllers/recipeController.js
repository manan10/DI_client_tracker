// backend/app-sous-chef/controllers/recipeController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cheerio = require('cheerio');
const Recipe = require('../models/Recipe');

// Initialize Gemini SDK with your environment key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Utility: Wait helper for exponential backoff retries
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Utility: Extract embed-safe URLs for YouTube & Instagram iframes
 */
const parseVideoUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { rawUrl: '', embedUrl: '', platform: 'NONE' };
  }

  const trimmed = rawUrl.trim();

  // YouTube match: standard watch, short, or youtu.be link
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return {
      rawUrl: trimmed,
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      platform: 'YOUTUBE',
      videoId: ytMatch[1],
    };
  }

  // Instagram Reel / Post match
  const instaMatch = trimmed.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
  if (instaMatch) {
    return {
      rawUrl: trimmed,
      embedUrl: `https://www.instagram.com/reel/${instaMatch[1]}/embed`,
      platform: 'INSTAGRAM',
      postId: instaMatch[1],
    };
  }

  return {
    rawUrl: trimmed,
    embedUrl: trimmed,
    platform: trimmed ? 'DIRECT' : 'NONE',
  };
};

/**
 * Core Helper: Invokes Gemini 2.5 Flash with resilient retry logic
 */
const runGeminiRecipeParser = async (rawText) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const prompt = `
    You are an expert Indian chef and culinary data parser for an application named Sous Chef.
    Your task is to parse raw, unstructured, multi-lingual (English, Hindi, Gujarati, Hinglish) recipes or post descriptions into valid JSON matching the exact schema below.

    Strict Parsing Rules:
    1. Title: Create a clean, appetizing title (e.g., "Restaurant Style Dal Khichdi").
    2. Servings: If a range like "2-3 people" is given, extract the numeric value (e.g., 3). Default to 4 if not specified.
    3. Times: If a range like "20-25 minutes" is given, extract the max number (e.g., 25).
    4. Ingredients:
       - Clean bilingual text into a clean name (e.g. "Split pigeon peas | तूर दाल" -> "Toor Dal (Split Pigeon Peas)").
       - Convert fractions into decimals (e.g. "1/2" -> 0.5, "3/4th" -> 0.75, "1/4" -> 0.25).
       - Normalize unit strings (e.g. "cup", "tbsp", "tsp", "nos", "grams", "pinch", "ml"). If "to taste", use quantity: 0 and unit: "to taste".
       - Identify pantry staples (salt, oil, ghee, water, turmeric powder, hing, jeera/cumin seeds, mustard seeds) and set isPantryStaple: true.
    5. Instructions:
       - Combine all multi-stage steps into an ordered chronological array of steps (1, 2, 3...).
       - Provide a short descriptive title for each step (e.g., "Pressure Cook Dal", "Parboil Basmati Rice", "Prepare Tadka").
       - Extract timer duration in seconds if specified (e.g. "boil for 6-7 minutes" -> 420, "cook for 2-3 minutes" -> 180, otherwise 0).
    6. Dietary Flags:
       - If onions, garlic, potatoes, or root vegetables are present: isJain must be false.
       - If onions or garlic are present: isSwaminarayan must be false.
       - Unless meat, fish, chicken, or eggs are present: isVegetarian must be true.
       - If milk/ghee/butter/paneer/curd is present: isVegan must be false.
       - If wheat, maida, sooji, or asafoetida with wheat flour is present: isGlutenFree must be false.

    Expected JSON Structure:
    {
      "title": "string",
      "description": "string",
      "cuisine": "Gujarati" | "North Indian" | "South Indian" | "Street Food" | "Italian" | "Asian" | "Continental" | "Dessert" | "Other",
      "courseType": "Main Course" | "Appetizer / Snack" | "Dessert" | "Breakfast" | "Beverage" | "Side Dish" | "Other",
      "difficulty": "Easy" | "Medium" | "Expert",
      "baseServings": number,
      "prepTimeMinutes": number,
      "cookTimeMinutes": number,
      "tags": ["string"],
      "dietaryFlags": {
        "isVegetarian": boolean,
        "isJain": boolean,
        "isSwaminarayan": boolean,
        "isVegan": boolean,
        "isGlutenFree": boolean
      },
      "ingredients": [
        {
          "name": "string",
          "quantity": number,
          "unit": "string",
          "isPantryStaple": boolean,
          "notes": "string"
        }
      ],
      "instructions": [
        {
          "stepNumber": number,
          "title": "string",
          "instruction": "string",
          "timerDurationSeconds": number,
          "chefTip": "string"
        }
      ]
    }

    RAW RECIPE / DESCRIPTION TEXT TO PARSE:
    ${rawText}
  `;

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text().trim());
    } catch (err) {
      lastError = err;
      const isTemporary =
        err.status === 503 ||
        err.status === 429 ||
        (err.message && (err.message.includes('503') || err.message.includes('429')));

      if (isTemporary && attempt < 3) {
        const delay = attempt * 2500;
        console.warn(
          `Gemini 2.5 Flash busy (503/429). Retrying in ${delay / 1000}s (Attempt ${attempt}/3)...`
        );
        await wait(delay);
        continue;
      }
      break;
    }
  }

  throw lastError;
};

/**
 * Helper: Extract YouTube Description and Title WITHOUT Video Captions
 * 1. Checks YouTube oEmbed for official Title
 * 2. Fetches the page HTML to read ytInitialData or OpenGraph/Schema description tags
 */
const fetchYouTubeDescription = async (videoId) => {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  let title = '';
  let description = '';

  // 1. Fetch title from oEmbed
  try {
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`
    );
    if (oembedRes.ok) {
      const oembedData = await oembedRes.json();
      title = oembedData.title || '';
    }
  } catch (err) {
    console.warn('YouTube oEmbed skipped:', err.message);
  }

  // 2. Fetch page HTML to extract full video description
  try {
    const pageRes = await fetch(watchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (pageRes.ok) {
      const html = await pageRes.text();
      const $ = cheerio.load(html);

      // Attempt A: Extract from ytInitialData / ytInitialPlayerResponse JSON payload
      const descMatch = html.match(/"shortDescription":"(.*?)"(?:,"isCrawlable"|,"thumbnail")/s);
      if (descMatch && descMatch[1]) {
        try {
          description = JSON.parse(`"${descMatch[1]}"`);
        } catch {
          description = descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
        }
      }

      // Attempt B: Fallback to Meta / Schema tags
      if (!description.trim()) {
        const metaDesc =
          $('meta[name="description"]').attr('content') ||
          $('meta[property="og:description"]').attr('content') ||
          '';
        description = metaDesc.trim();
      }

      if (!title) {
        title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
      }
    }
  } catch (err) {
    console.warn('YouTube page fetch error:', err.message);
  }

  const combined = [
    title ? `Video Title: ${title}` : '',
    description ? `Video Description:\n${description}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return { text: combined.trim(), title, description };
};

/**
 * Helper: Extract Instagram Reel/Post caption using OpenGraph meta tags
 */
const fetchInstagramContent = async (url) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`Instagram returned HTTP status ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const ogDesc = $('meta[property="og:description"]').attr('content') || '';
    const ogTitle = $('meta[property="og:title"]').attr('content') || '';
    const twitterDesc = $('meta[name="twitter:description"]').attr('content') || '';

    const caption = ogDesc || twitterDesc || ogTitle;
    return caption.trim();
  } catch (err) {
    console.warn('Instagram scrape error:', err.message);
    return '';
  }
};

/**
 * @route   POST /api/recipes/parse-url
 * @desc    Extract description only from YouTube/Instagram URL and parse into structured recipe
 */
exports.parseRecipeUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string' || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid YouTube or Instagram link.',
      });
    }

    const targetUrl = url.trim();
    const videoData = parseVideoUrl(targetUrl);

    if (videoData.platform === 'NONE') {
      return res.status(400).json({
        success: false,
        message: 'Unsupported link. Please paste a valid YouTube or Instagram URL.',
      });
    }

    let extractedText = '';

    if (videoData.platform === 'YOUTUBE') {
      const ytResult = await fetchYouTubeDescription(videoData.videoId);
      extractedText = ytResult.text;

      if (!extractedText || (!ytResult.description && !ytResult.title)) {
        return res.status(422).json({
          success: false,
          platform: 'YOUTUBE',
          videoUrl: targetUrl,
          message:
            'Could not find a recipe description in this YouTube video. Please paste the recipe text manually using the text tab.',
        });
      }
    } else if (videoData.platform === 'INSTAGRAM') {
      extractedText = await fetchInstagramContent(targetUrl);

      if (!extractedText) {
        return res.status(422).json({
          success: false,
          platform: 'INSTAGRAM',
          videoUrl: targetUrl,
          message:
            'Could not extract the caption from Instagram (login challenge). Please copy and paste the post caption manually.',
        });
      }
    }

    // Process the extracted description with Gemini
    const parsedRecipe = await runGeminiRecipeParser(extractedText);

    return res.status(200).json({
      success: true,
      platform: videoData.platform,
      videoUrl: targetUrl,
      data: parsedRecipe,
    });
  } catch (error) {
    console.error('URL Recipe Parser Error:', error);
    const statusCode = error.status === 503 ? 503 : 500;
    return res.status(statusCode).json({
      success: false,
      message:
        error.status === 503
          ? 'Google AI is currently under high demand. Please try again in a moment.'
          : error.message || 'Failed to parse recipe from URL',
    });
  }
};

/**
 * @route   POST /api/recipes/parse
 * @desc    Parse raw, free-form recipe text into structured recipe format via Gemini
 */
exports.parseRawRecipe = async (req, res) => {
  try {
    const { rawText } = req.body;

    if (!rawText || !rawText.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide raw recipe text to parse',
      });
    }

    const parsedJson = await runGeminiRecipeParser(rawText);

    return res.status(200).json({
      success: true,
      data: parsedJson,
    });
  } catch (error) {
    console.error('Gemini Recipe Parser Error:', error);
    const statusCode = error.status === 503 ? 503 : 500;
    return res.status(statusCode).json({
      success: false,
      message:
        error.status === 503
          ? 'Google AI is currently under high demand. Please try again in a moment.'
          : error.message || 'Failed to parse recipe with Gemini',
    });
  }
};

/**
 * @route   GET /api/recipes
 * @desc    Get all recipes with multi-facet filters & dietary toggles
 */
exports.getRecipes = async (req, res) => {
  try {
    const {
      search,
      cuisine,
      courseType,
      isJain,
      isSwaminarayan,
      isVegetarian,
      isVegan,
      isGlutenFree,
    } = req.query;
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }
    if (cuisine && cuisine !== 'All') {
      filter.cuisine = cuisine;
    }
    if (courseType) {
      filter.courseType = courseType;
    }

    if (isJain === 'true') filter['dietaryFlags.isJain'] = true;
    if (isSwaminarayan === 'true') filter['dietaryFlags.isSwaminarayan'] = true;
    if (isVegetarian === 'true') filter['dietaryFlags.isVegetarian'] = true;
    if (isVegan === 'true') filter['dietaryFlags.isVegan'] = true;
    if (isGlutenFree === 'true') filter['dietaryFlags.isGlutenFree'] = true;

    const recipes = await Recipe.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/recipes/:id
 * @desc    Get single recipe with optional portion scaling calculation
 */
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { targetServings } = req.query;

    const recipe = await Recipe.findById(id).populate('createdBy', 'name email');
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    const recipeObj = recipe.toObject();

    if (targetServings && Number(targetServings) > 0) {
      const scaleFactor = Number(targetServings) / recipe.baseServings;
      recipeObj.scaledServings = Number(targetServings);
      recipeObj.scaleFactor = scaleFactor;
      recipeObj.ingredients = recipeObj.ingredients.map((item) => ({
        ...item,
        scaledQuantity: Number((item.quantity * scaleFactor).toFixed(2)),
      }));
    }

    return res.status(200).json({
      success: true,
      data: recipeObj,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/recipes
 * @desc    Create a new recipe
 */
exports.createRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      cuisine,
      courseType,
      difficulty,
      baseServings,
      prepTimeMinutes,
      cookTimeMinutes,
      dietaryFlags,
      ingredients,
      instructions,
      videoUrl,
      coverImage,
      tags,
    } = req.body;

    const videoData = parseVideoUrl(videoUrl);

    const newRecipe = await Recipe.create({
      title,
      description,
      cuisine,
      courseType,
      difficulty,
      baseServings: baseServings || 4,
      prepTimeMinutes: prepTimeMinutes || 0,
      cookTimeMinutes: cookTimeMinutes || 0,
      dietaryFlags: dietaryFlags || {},
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      instructions: Array.isArray(instructions) ? instructions : [],
      video: videoData,
      coverImage: coverImage || '',
      tags: Array.isArray(tags) ? tags : [],
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      data: newRecipe,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/recipes/:id
 * @desc    Update recipe details
 */
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.videoUrl !== undefined) {
      updateData.video = parseVideoUrl(updateData.videoUrl);
      delete updateData.videoUrl;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedRecipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    return res.status(200).json({
      success: true,
      data: updatedRecipe,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/recipes/:id
 * @desc    Delete recipe
 */
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findByIdAndDelete(id);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Recipe deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/recipes/suggest
 * @desc    Smart Pantry Match Engine
 */
exports.suggestRecipes = async (req, res) => {
  try {
    const { availableIngredients = [], dietaryFilters = {} } = req.body;

    if (!Array.isArray(availableIngredients) || availableIngredients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide an array of available ingredients',
      });
    }

    const normalizedAvailable = availableIngredients.map((item) =>
      item.trim().toLowerCase()
    );

    const filter = {};
    if (dietaryFilters.isJain) filter['dietaryFlags.isJain'] = true;
    if (dietaryFilters.isSwaminarayan) filter['dietaryFlags.isSwaminarayan'] = true;
    if (dietaryFilters.isVegetarian) filter['dietaryFlags.isVegetarian'] = true;
    if (dietaryFilters.isVegan) filter['dietaryFlags.isVegan'] = true;
    if (dietaryFilters.isGlutenFree) filter['dietaryFlags.isGlutenFree'] = true;

    const recipes = await Recipe.find(filter);

    const results = recipes.map((recipe) => {
      const nonStaples = recipe.ingredients.filter((ing) => !ing.isPantryStaple);
      const stapleCount = recipe.ingredients.length - nonStaples.length;

      let matchedItems = [];
      let missingItems = [];

      nonStaples.forEach((ing) => {
        const clean = ing.cleanName || ing.name.toLowerCase();
        const isMatched = normalizedAvailable.some(
          (userItem) => clean.includes(userItem) || userItem.includes(clean)
        );

        if (isMatched) {
          matchedItems.push(ing.name);
        } else {
          missingItems.push(ing.name);
        }
      });

      const totalRequired = nonStaples.length;
      const matchScore =
        totalRequired === 0
          ? 100
          : Math.round((matchedItems.length / totalRequired) * 100);

      return {
        _id: recipe._id,
        title: recipe.title,
        cuisine: recipe.cuisine,
        courseType: recipe.courseType,
        coverImage: recipe.coverImage,
        difficulty: recipe.difficulty,
        baseServings: recipe.baseServings,
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes,
        dietaryFlags: recipe.dietaryFlags,
        video: recipe.video,
        matchScore,
        matchedCount: matchedItems.length,
        totalRequiredCount: totalRequired,
        stapleCount,
        matchedIngredients: matchedItems,
        missingIngredients: missingItems,
        canMakeNow: missingItems.length === 0,
      };
    });

    results.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      totalMatched: results.length,
      data: {
        makeNow: results.filter((r) => r.canMakeNow),
        missingOneOrTwo: results.filter(
          (r) => !r.canMakeNow && r.missingIngredients.length <= 2
        ),
        groceryRunNeeded: results.filter(
          (r) => r.missingIngredients.length > 2
        ),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};