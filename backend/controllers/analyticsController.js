const Commission = require('../models/Commission');
const ARN = require('../models/Arn');

exports.getGlobalAnalytics = async (req, res) => {
  try {
    const report = await Commission.aggregate([
      {
        $facet: {
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

          "amcDistribution": [
            { $unwind: "$entries" },
            { 
              $group: { 
                _id: { $ifNull: ["$entries.amcId", "$entries.amcName"] }, 
                value: { $sum: "$entries.amount" } 
              } 
            },
            {
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
                name: { $ifNull: ["$amcInfo.name", { $ifNull: ["$_id", "Unknown AMC"] }] },
                value: 1
              }
            },
            { $sort: { value: -1 } },
            { $limit: 10 }
          ],
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

    const arnMap = {};
    data.arnDistribution.forEach(a => {
      arnMap[a._id.toString()] = a.nickname || a.arnCode || a._id.toString();
    });

    const monthlyWithDeltas = data.monthlyTotals.map((curr, idx, arr) => {
      const prev = arr[idx + 1];
      const delta = prev ? ((curr.total - prev.total) / prev.total) * 100 : 0;
      return { 
        ...curr, 
        delta: parseFloat(delta.toFixed(2)), 
        arnBreakdown: curr.arnBreakdown.map(b => ({ ...b, arnId: b.arnId.toString() })) 
      };
    });

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