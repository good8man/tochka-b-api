const {
    searchPerson,
    searchDeal,
    getDealDetails,
  } = require("../models/pipedrive/operations");


//   const getFullDeals = async deal => {
//     const acc = [];
//     // const pipeline_id = await getDealDetails(deal.item.id);
//     // return await {...deal.item, pipeline_id };
//   } 

  const addDeal = async (req) => {
    const {
        body: { Name, Phone,  utm_source, utm_medium, utm_campaign, utm_term, utm_content},
      } = req;
      const foundedPersons = await searchPerson(Phone);  
    //   console.log(Name, Phone);
    // const { data: items } = await searchPerson(Phone);
    if (foundedPersons.length) console.log("found Person");
    const foundedDeals = await searchDeal(Phone);  
    const foundedActiveDeals = foundedDeals.filter(deal => deal.item.status === 'open');
    const foundedClosedDeals = foundedDeals.filter(deal => deal.item.status !== 'open');
    if (foundedDeals.length) console.log("found Deals", foundedDeals.length);
    if (foundedActiveDeals.length) {
        console.log("found active deals", foundedActiveDeals.length);
        const deals = await getDealDetails(foundedActiveDeals.map(deal => deal.item.id))
        const foundedPipelines1 = deals.find(deal => deal.pipeline_id === 1);
        const foundedPipelines2 = deals.find(deal => deal.pipeline_id === 2);
        const foundedPipelines3 = deals.find(deal => deal.pipeline_id === 3);
        if (foundedPipelines1) console.log("found active deals Pipeline 1");
        if (foundedPipelines2) console.log("found active deals Pipeline 2");
        if (foundedPipelines3) console.log("found active deals Pipeline 3");

    } else {  
    if (foundedClosedDeals.length) console.log("found closed deals", foundedClosedDeals.length);
    }

  }

  module.exports = {
    addDeal,
  };