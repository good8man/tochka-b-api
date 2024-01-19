const {
    searchPerson,
    addPerson,
    addNote,
    addDeal,
    editDeal,
    searchDeal,
    duplicateDeal,
    addActivities,
    getDealDetails,
  } = require("../models/pipedrive/operations");

  const newLead = async (req) => {
    const {
        body: {
          Name, 
          Phone, 
          Email, 
          utm_source, 
          utm_medium, 
          utm_campaign, 
          utm_term, 
          utm_content,
          ['Яка_ваша_роль_в_бізнесі']: role2,
          ['Скільки_у_відділі_менеджерів_з_продажу']: quantity2,
          ['Роль']: role3,
          ['Кол-во_продавцов']: quantity3,
          ['Объем_продаж']: volume,
          ['Функция_руководителя']: func,
          ['Какие_проблемы']: probl,
          ['Имя']: name2,
          ['Телефон']: phone2,
          ['Почта']: email2,
        },
      } = req;
      let personsId = ''; 
      let source = '(main)';
      const referer = req.get("Referer");
      if (referer && referer.includes("/ex1")) source = '(ex)';
      if (referer && referer.includes("/lm1")) source = 'ЛІД-магніт';
      const role = role2 ? role2 : role3 ? role3 : "";
      const quantity = quantity2 ? quantity2 : quantity3 ? quantity3 : "";
      const personName = Name ? Name : name2 ? name2 : "Undefined name";
      const personPhone = Phone ? Phone : phone2 ? phone2 : "";
      const personEmail = Email ? Email : email2 ? email2 : "";
      const title = `Test Клієнт залишив заявку на${source !== 'ЛІД-магніт' ? " консультацію" : ''} ${source}`;
      const data = role ? ` Результат опитування: Роль? ${role}, Кількість продавців? ${quantity}${volume ? `, Обʼєм продажів? ${volume}, Функція керівника? ${func}, Які проблеми? ${probl}` : ""}` : '';
      const content = `Клієнт ${personName} ${personPhone} ${personEmail} залишив повторну заявку на${source !== 'ЛІД-магніт' ? " консультацію, джерело " : ''} ${source}${data}`;
      const content1 = `Заявка від клієнта ${personName} ${personPhone} ${personEmail} на${source !== 'ЛІД-магніт' ? " консультацію, джерело " : ''} ${source}${data}`;
      // console.log(referer);
      console.log("source:", source);
      // console.log(req.body);
      if (!personPhone) return;
      const foundedPerson = await searchPerson(personPhone);
      if (foundedPerson.length) {
        personsId = foundedPerson[0].item.id
        console.log("found Person", personsId);    
      } else {
        console.log("Person not found");
        const body = {name: personName}
        if (personPhone) body.phone = personPhone;
        if (personEmail) body.email = personEmail;
        const newPerson = await addPerson(body);
        if (newPerson) personsId = newPerson.id;
        console.log("new person id", personsId);
      }

      const foundedDeals = await searchDeal(personPhone);
      const foundedActiveDeals = foundedDeals.filter(deal => deal.item.status === 'open');
      const foundedClosedDeals = foundedDeals.filter(deal => deal.item.status !== 'open');    
    if (foundedDeals.length) {
      console.log("found Deals", foundedDeals.length);
    if (foundedActiveDeals.length) {
        console.log("found active deals", foundedActiveDeals.length);
        const deals = await getDealDetails(foundedActiveDeals.map(deal => deal.item.id))
        const foundedPipelines1 = deals.find(deal => deal.pipeline_id === 1);
        const foundedPipelines2 = deals.find(deal => deal.pipeline_id === 2);
        const foundedPipelines3 = deals.find(deal => deal.pipeline_id === 3);
        if (foundedPipelines1) {
          console.log("found active deals Pipeline 1", foundedPipelines1.id );
          const notesBody = {deal_id: foundedPipelines1.id, content};
          const activitiesBody = {deal_id: foundedPipelines1.id, note: content};
          const newNote = await addNote(notesBody);
          const newActivities = await addActivities(activitiesBody);
        }
        if (foundedPipelines2) {
          console.log("found active deals Pipeline 2");
          const body = {pipeline_id: 1};
          const notesBody = {deal_id: foundedPipelines2.id, content};
          const activitiesBody = {deal_id: foundedPipelines2.id, note: content};
          const editedDeal = await editDeal(foundedPipelines2.id, body); 
          const newActivities = await addActivities(activitiesBody); 
          const newNote = await addNote(notesBody);
        }
        if (foundedPipelines3) {
          console.log("found active deals Pipeline 3");
          const notesBody = {deal_id: foundedPipelines3.id, content};
          const activitiesBody = {deal_id: foundedPipelines3.id, note: content};
          const newActivities = await addActivities(activitiesBody);
          const newNote = await addNote(notesBody); 
        }

    } else {  
    if (foundedClosedDeals.length) {
      console.log("found closed deals", foundedClosedDeals.length);
      console.log("id",foundedClosedDeals[0].item.id);
      const body = {title, status: "open", pipeline_id: 1, person_id: personsId};
      if (utm_source) body["9866a4195e069161f192f563c269b463b4ea0688"] = utm_source;
      if (utm_medium) body["ce4db30445a2acfb1593b51034ff9f303e679926"] = utm_medium;
      if (utm_campaign) body["50966a75b48a959f8fdff6d001e46b78d2778bd2"] = utm_campaign;
      if (utm_term) body["d0503ee8929b0158e144aa74e818c1683152609a"] = utm_term;
      if (utm_content) body["0b9b6f42c6ea10f8cd5e6d54463dbfecf6e7c2bf"] = utm_content;

      const newDeal = await duplicateDeal(foundedClosedDeals[0].item.id);
      const editedDeal = await editDeal(newDeal.id, body); 
      const notesBody = {deal_id: newDeal.id, content};
      const newNote = await addNote(notesBody);
    }
    }
  } else {  
    console.log("Deals not found");
    const body = {person_id: personsId, title, pipeline_id: 1};
    // if (source === '(main)') body.pipeline_id = 1;
    // if (source === '(ex)') body.pipeline_id = 2;
    // if (source === 'ЛІД-магніт') body.pipeline_id = 3;

    if (utm_source) body["9866a4195e069161f192f563c269b463b4ea0688"] = utm_source;
    if (utm_medium) body["ce4db30445a2acfb1593b51034ff9f303e679926"] = utm_medium;
    if (utm_campaign) body["50966a75b48a959f8fdff6d001e46b78d2778bd2"] = utm_campaign;
    if (utm_term) body["d0503ee8929b0158e144aa74e818c1683152609a"] = utm_term;
    if (utm_content) body["0b9b6f42c6ea10f8cd5e6d54463dbfecf6e7c2bf"] = utm_content;
    const newDeal = await addDeal(body);
    const notesBody = {deal_id: newDeal.id, content: content1};
    const newNote = await addNote(notesBody);
    }
  }

  module.exports = {
    newLead,
  };