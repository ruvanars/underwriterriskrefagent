const express = require("express");
const sql = require("mssql");
const config = require("../db/sqlConfig");

const router = express.Router();
function extractLimitsFromText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  let limits = [];
  let currentCoverage = '-';

  for (const line of lines) {
    // If line is a heading / coverage title
    if (line.startsWith('**Coverage for') || line.startsWith('**Sub-Limits') || line.startsWith('**Endorsements')) {
      currentCoverage = line.replace(/\*\*/g, '').replace(':', '').trim();
      continue;
    }

    // If line is a specific item inside a section
    if (line.startsWith('- **')) {
      currentCoverage = line.replace(/- \*\*(.*)\*\*:.*/, '$1').trim();
    } else if (line.startsWith('-')) {
      currentCoverage = line.replace(/^-/, '').trim();   // <-- 🔥 Remove leading dash and spaces
    }

    // If line contains GBP amount
    const amountMatch = line.match(/GBP\s?([\d,]+)/i);
    if (amountMatch) {
      let amount = parseInt(amountMatch[1].replace(/,/g, ''));     
    }

  }
  limits.push({
    coverageName: "Casualty/Retail Casualty: General Liability - Band 4",
    currency: 'GBP',
    amount: 25000000,
    region: 'UK & Lloyds'
  });

  return limits;
}
const coverageNameMapping = {
  "Any one Event": "Casualty/Retail Casualty: General Liability - Band 4",
  "Products": "Casualty/Retail Casualty: General Liability - Band 3",
  "Pollutants": "Casualty/Retail Casualty: General Liability - Band 2",
  "Corporate Manslaughter and Corporate Homicide Act 2007 - Defence Costs": "Casualty/Retail Casualty: Coverage extensions Loss of Use, Product Recall, Pure Financial Loss, Professional Indemnity",
  // Add more mappings as needed
};
function mapCoverageName(documentCoverageName) {
  //return coverageNameMapping[documentCoverageName] || documentCoverageName;
  return "Casualty/Retail Casualty: General Liability - Band 4"
}

router.post("/checkcoveragelimitfromdb", async (req, res) => {
 
  const { policyText } = req.body.policyText;  
  console.log("Incoming body policyText:", policyText);
  try {
    console.log("Connecting to database...");

    var coveragelimit;
    let amount = await callCheckCoverageLimit();    
    console.log("Amount: Step 2", amount[0].maxgrosslimit);
    coveragelimit = amount[0].maxgrosslimit;
    
    /*console.log("Coveragelimit: Step 2", coveragelimit);
    //***********Get SoA Questions 

    await sql.connect(config);
    var sqlquery = "SELECT SoAQuestion FROM UnderwriterQuestions  where Recipient = '" +  "Gaurav Sharma" + "'" + " ORDER BY Recipient, RecipientJobTitle";   
    const result = await sql.query(sqlquery);
     const soaQuestionsArray = result.recordset.map(row => row.SoAQuestion);
     console.log("SoAQuestions Array:", soaQuestionsArray);
    const questionscanbeasked = {};
    result.recordset.forEach(row => {
      questionscanbeasked["SoAQuestion"] = row.SoAQuestion;      
    });
   
    //***********Check if co is banned 
    //await sql.connect(config);
    var sqlquerybanned = `SELECT CompanyName, SubsidiaryName, 
          CASE 
           WHEN ShaleOilAndGas = 'Ban' THEN 'Shale Oil and Gas'
           WHEN OilSandsTarSands = 'Ban' THEN 'Oil Sands / Tar Sands'
           WHEN UltraDeepwater = 'Ban' THEN 'Ultra Deepwater'
           WHEN Arctic = 'Ban' THEN 'Arctic'
           ELSE 'Not Banned'
       END AS BanReason
      FROM EnergyCompanies
      WHERE CompanyName = 'Comp3Resources LLC'`;
      
      const banresult = await sql.query(sqlquerybanned);
      console.log("Ban result:" + JSON.stringify(banresult.recordset));
      const banReasons = banresult.recordset.map(row => row.BanReason);
      */
      //console.log(answer + "\n" + " Coveragelimit: " + coveragelimit + "\n" + " questions: " + soaQuestionsArray  + "\n"+ "Banned " + banresult.recordset)
    res.json({
      Coveragelimit: coveragelimit          
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    sql.close();
  }
});
router.post("/checkquestions", async (req, res) => {
  console.log("Incoming body:", req.body);
  const  policyText  = req.body.policyText; 
  console.log("policyText", policyText);
  await sql.connect(config);
    var sqlquery = "SELECT SoAQuestion FROM UnderwriterQuestions  where Recipient = '" +  "Gaurav Sharma" + "'" + " ORDER BY Recipient, RecipientJobTitle";   
    const result = await sql.query(sqlquery);
     const soaQuestionsArray = result.recordset.map(row => row.SoAQuestion);
     console.log("SoAQuestions Array:", soaQuestionsArray);
    var questionscanbeasked = "No, you cannot answer this question";

    for (let row of soaQuestionsArray) {
      console.log(row, policyText);
      if(row ===  policyText)
        {
          console.log(row, policyText);
          questionscanbeasked = "Yes, you can answer this question";
          break; 
        }        
    };
    console.log("questionscanbeasked", questionscanbeasked);
    return res.json(questionscanbeasked);
});

router.post("/checkban", async (req, res) => {
  console.log("Incoming body:", req.body);
  await sql.connect(config);
    var sqlquerybanned = `SELECT CompanyName, SubsidiaryName, 
          CASE 
           WHEN ShaleOilAndGas = 'Ban' THEN 'Shale Oil and Gas'
           WHEN OilSandsTarSands = 'Ban' THEN 'Oil Sands / Tar Sands'
           WHEN UltraDeepwater = 'Ban' THEN 'Ultra Deepwater'
           WHEN Arctic = 'Ban' THEN 'Arctic'
           ELSE 'Not Banned'
       END AS BanReason
      FROM EnergyCompanies
      WHERE CompanyName = 'Comp3Resources LLC'`;
      
      const banresult = await sql.query(sqlquerybanned);
      console.log("Ban result:" + JSON.stringify(banresult.recordset));      
      res.json({
        Banresult: banresult.recordset          
      });
});
async function callCheckCoverageLimit(mappedCoverageName, region, currency, amount) {
  try {
    await sql.connect(config);
    var sqlquery = "select max(MaxGrossLimit) as maxgrosslimit from [dbo].[CoverageLimits] where coverageuser = 'Gaurav Sharma'";   
    const result = await sql.query(sqlquery);
    return result.recordset;
    
  } catch (err) {
    console.error('Error running stored procedure:', err);
  } finally {
    await sql.close();
  }
}

router.get("/checking-deductibles", async (req, res) => {
  return res.json("I am in checkingdeductables");
});

module.exports = router;
