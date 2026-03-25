const Commission = require('../models/Commission');
const ARN = require('../models/Arn');

exports.getGlobalAnalytics = async (req, res) => {
  try {
    const report = await Commission.aggregate([
      {
        $facet: {
          // 1. Monthly Aggregates (Root level - Remains Same)
          "monthlyTotals": [
            { 
              $group: { 
                _id: { month: "$accountingMonth", arnId: "$arnId" }, 
                totalGross: { $sum: "$totalGross" } 
              } 
            },
            { 
              $group: { 
                _id: "$_id.month", 
                total: { $sum: "$totalGross" },
                arnBreakdown: { $push: { arnId: "$_id.arnId", amount: "$totalGross" } }
              } 
            },
            { $sort: { "_id": -1 } }
          ],

          // 2. ARN Distribution (Root level - Remains Same)
          "arnDistribution": [
            { $group: { _id: "$arnId", value: { $sum: "$totalGross" } } },
            { $lookup: {
                from: "arns", 
                localField: "_id",
                foreignField: "_id",
                as: "arnDetails"
            }},
            { $unwind: { path: "$arnDetails", preserveNullAndEmptyArrays: true } },
            { $project: { 
                _id: 1, 
                value: 1, 
                nickname: { $ifNull: ["$arnDetails.nickname", "$_id"] },
                arnCode: "$arnDetails.arnCode" 
            }},
            { $sort: { value: -1 } }
          ],

          // 3. AMC Distribution (FIXED: Handles Nested Entries)
          "amcDistribution": [
            { $unwind: "$entries" }, // Step 1: Flatten the entries array
            { 
              $group: { 
                // Step 2: Group by amcId OR amcName inside the unwound entry
                _id: { $ifNull: ["$entries.amcId", "$entries.amcName"] }, 
                value: { $sum: "$entries.amount" } 
              } 
            },
            {
              // Step 3: Fetch clean names from your AMC master collection
              $lookup: {
                from: "amcs",
                localField: "_id",
                foreignField: "_id",
                as: "amcInfo"
              }
            },
            { $unwind: { path: "$amcInfo", preserveNullAndEmptyArrays: true } },
            {
              $project: {
                // Step 4: Final name selection
                name: { $ifNull: ["$amcInfo.name", { $ifNull: ["$_id", "Unknown AMC"] }] },
                value: 1
              }
            },
            { $sort: { value: -1 } },
            { $limit: 10 }
          ],

          // 4. Seasonality (Remains Same)
          "seasonalityRaw": [
             { $group: { _id: "$accountingMonth", monthlySum: { $sum: "$totalGross" } } },
             { $project: {
                 monthNum: { $arrayElemAt: [{ $split: ["$_id", "-"] }, 1] },
                 monthlySum: 1
               }
             },
             { $group: { _id: "$monthNum", avgRevenue: { $avg: "$monthlySum" } } },
             { $sort: { "_id": 1 } }
          ]
        }
      }
    ]);

    const data = report[0];

    // Identity Mappings
    const arnMap = {};
    data.arnDistribution.forEach(a => {
      arnMap[a._id.toString()] = a.nickname || a.arnCode || a._id.toString();
    });

    // Monthly Deltas
    const monthlyWithDeltas = data.monthlyTotals.map((curr, idx, arr) => {
      const prev = arr[idx + 1];
      const delta = prev ? ((curr.total - prev.total) / prev.total) * 100 : 0;
      return { 
        ...curr, 
        delta: parseFloat(delta.toFixed(2)), 
        arnBreakdown: curr.arnBreakdown.map(b => ({ ...b, arnId: b.arnId.toString() })) 
      };
    });

    // Financial Year Logic
    const fyTotals = {};
    data.monthlyTotals.forEach(item => {
      const parts = item._id.split('-');
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]);
      const fy = month >= 4 ? `${year}-${(year + 1).toString().slice(-2)}` : `${year - 1}-${year.toString().slice(-2)}`;
      fyTotals[fy] = (fyTotals[fy] || 0) + item.total;
    });

    const fySortedKeys = Object.keys(fyTotals).sort().reverse();
    const fiscalYears = fySortedKeys.map((fy, idx) => {
      const currentVal = fyTotals[fy];
      const prevVal = fyTotals[fySortedKeys[idx + 1]];
      const growth = prevVal ? ((currentVal - prevVal) / prevVal) * 100 : 0;
      return { fiscalYear: fy, total: currentVal, yoyGrowth: parseFloat(growth.toFixed(2)) };
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEnterpriseRevenue: data.arnDistribution.reduce((acc, curr) => acc + curr.value, 0),
          activeARNsCount: data.arnDistribution.length,
          lastMonthTotal: monthlyWithDeltas[0]?.total || 0,
          lastMonthDelta: monthlyWithDeltas[0]?.delta || 0,
          topPerformingARN: data.arnDistribution[0]?.nickname || 'N/A'
        },
        monthlyAggregates: monthlyWithDeltas,
        fiscalYearTotals: fiscalYears,
        arnConcentration: data.arnDistribution,
        amcConcentration: data.amcDistribution, 
        seasonality: data.seasonalityRaw.map(s => ({ month: s._id, avgRevenue: s.avgRevenue })),
        uniqueARNs: data.arnDistribution.map(arn => arn._id.toString()),
        arnNicknameMap: arnMap 
      }
    });
  } catch (err) {
    console.error("Aggregation Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};