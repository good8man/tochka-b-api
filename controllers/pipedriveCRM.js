const {
    searchPerson,
    editPerson,
    addPerson,
    getNotes,
    addNote,
    addDeal,
    editDeal,
    searchDeal,
    duplicateDeal,
    getActivities,
    addActivities,
    searchAllDeals,
    getDealDetails,
  } = require("../models/pipedrive/operations");

  const newLead = async (req) => {
    const {
        body: {
          Name, 
          Phone, 
          Email,
          formid, 
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
      let label = '24';
      let labelColor = '#a0419d';
      let source = '(main)';
      let foundedPerson = [];
      let foundedDeals = [];
      
      const referer = req.get("Referer");
      if (referer && referer.includes("/ex1")) {
        label = '23';
        labelColor = '#d63033';
        if (formid && formid === 'form610726258') source = 'Ex Ф1';
        if (formid && formid === 'form625077433') source = 'Ex pop-up';
        if (formid && formid !== 'form625077433' && formid !== 'form610726258') source = 'Ex Ф2';
      }
      if (referer && referer.includes("/lm1")) {
        label = '22';
        labelColor = '#4164d4';
        if (formid && formid === 'form572806238') source = 'Lm Ф1';
        if (formid && formid !== 'form572806238') source = 'Lm Ф2';
      }
      if (referer && !referer.includes("/lm1") && !referer.includes("/ex1")) {
        if (formid && formid === 'form567612805') source = 'Головна Ф1';
        if (formid && formid === 'form567612798') source = 'Головна Ф2';
        if (formid && formid === 'form567612808') source = 'Головна Ф3';
      }
      
      const role = role2 ? role2 : role3 ? role3 : "";
      const quantity = quantity2 ? quantity2 : quantity3 ? quantity3 : "";
      const personName = Name ? Name : name2 ? name2 : "Undefined name";
      const personPhone = Phone ? Phone : phone2 ? phone2 : "";
      const personEmail = Email ? Email : email2 ? email2 : "";
      const title = source;
      const data = role ? `<table><caption><h3>Результат опитування&nbsp;</h3></caption><tr><td>Роль:</td><td>${role}</td></tr><tr><td>Кількість продавців:</td><td>${quantity}</td></tr>${volume ? `<tr><td>Обʼєм продажів:</td><td>${volume}</td></tr><tr><td>Функція керівника:</td><td>${func}</td></tr><tr><td>Які проблеми:</td><td><span>${probl.replace(/;/g, "</span></br><span>")}</span></td></tr>` : ""}</table>` : "";
      const content = `<h2>Клієнт залишив повторну заявку на <span style='background-color: #ffffff; color: ${labelColor};'>${source}</span>&nbsp;&nbsp;&nbsp;</h2><div><table><caption><h3>Контактна інформація&nbsp;</h3></caption><tr><td>Імʼя:</td><td>${personName}&nbsp;</td></tr><tr><td>Телефон:</td><td>${personPhone}&nbsp;</td></tr>${personEmail ? `<tr><td>Email:</td><td>${personEmail}&nbsp;&nbsp;</td></tr>` : "&nbsp;&nbsp;"}</table></br>${data}`;
      const content1 = `<h2>Клієнт залишив заявку на <span style='background-color: #ffffff; color: ${labelColor};'>${source}</span>&nbsp;&nbsp;&nbsp;</h2><div><table><caption><h3>Контактна інформація&nbsp;</h3></caption><tr><td>Імʼя:</td><td>${personName}&nbsp;</td></tr><tr><td>Телефон:</td><td>${personPhone}&nbsp;</td></tr>${personEmail ? `<tr><td>Email:</td><td>${personEmail}&nbsp;&nbsp;</td></tr>` : "&nbsp;&nbsp;"}</table></br>${data}`;
     
      // console.log(req.body);
      if (!personPhone && !personEmail) return;

      if (personPhone) {
        const foundedPersonPhone = await searchPerson(personPhone);
        // console.log("found Person Phone", foundedPersonPhone.length); 
        if (foundedPersonPhone && foundedPersonPhone.length) foundedPersonPhone.map(({ item: { id, phones, emails }}) => foundedPerson.push({ id, phones, emails }));
      }
      if (personEmail) {
        const foundedPersonEmail = await searchPerson(personEmail);
        // console.log("found Person Email", foundedPersonEmail.length);    
        if (foundedPersonEmail && foundedPersonEmail.length) {
          foundedPersonEmail.map(({ item: { id, phones, emails }}) => {
          const ids = foundedPerson.map(person => person.id);
          if (!ids.includes(id)) foundedPerson.push({ id, phones, emails });
        });
      }
      }

      if (foundedPerson.length) {
        personsId = foundedPerson[0].id;
        if (personEmail && !foundedPerson[0].emails.includes(personEmail)) {
          // console.log("add new email to person", personsId);
          const newEmails = foundedPerson[0].emails;
          newEmails.push(personEmail);
          const body = {email: newEmails};
          const editedPerson = await editPerson(personsId, body);
        }
        // console.log("found Person", personsId);    
      } else {
        // console.log("Person not found");
        const body = {name: personName};
        if (personPhone) body.phone = [{ value: personPhone, primary: true, label: "mobile" }];
        if (personEmail) body.email = [{ value: personEmail, primary: true, label: "main" }];
        const newPerson = await addPerson(body);
        if (newPerson) personsId = newPerson.id;
        // console.log("new person id", personsId);
      }
      if (personPhone) {
      const foundedDealsPhone = await searchDeal({term: personPhone, custom_fields: "phone" });
      // console.log("found deals by phone", foundedDealsPhone.length);
      if (foundedDealsPhone && foundedDealsPhone.length) foundedDealsPhone.map(({ item: { id }}) => foundedDeals.push(id));
      }
      if (personEmail) {
        const foundedDealsEmail = await searchDeal({term: personEmail});
      // console.log("found deals by Email", foundedDealsEmail.length);    
        if (foundedDealsEmail && foundedDealsEmail.length) {
          foundedDealsEmail.map(({ item: { id }}) => {
          if (!foundedDeals.includes(id)) foundedDeals.push(id);
        });
      }
      }
      if (foundedPerson && foundedPerson.length) {
      const foundedDealsPerson = await searchAllDeals(foundedPerson.map(person => person.id))
      // console.log("found deals by persons", foundedDealsPerson.length);
      if (foundedDealsPerson && foundedDealsPerson.length) {
        foundedDealsPerson.map(({ id }) => {
        if (!foundedDeals.includes(id)) foundedDeals.push(id);
      });
      }     
      }
      const deals = await getDealDetails(foundedDeals);
      const sortedDeals = deals.sort(function(a, b) {
        var dateA = new Date(a.add_time);
        var dateB = new Date(b.add_time);
        return dateB - dateA;
      });
      const foundedActiveDeals = sortedDeals.filter(deal => deal.status === 'open');
      const foundedClosedDeals = sortedDeals.filter(deal => deal.status !== 'open');
      // console.log("found Deals", foundedDeals.length);
      // console.log("found active deals", foundedActiveDeals.length);
      // console.log("found closed deals", foundedClosedDeals.length);
      
    if (foundedDeals.length) {
      // console.log("found unique Deals", foundedDeals.length);
    if (foundedActiveDeals.length) {
        // console.log("found active deals", foundedActiveDeals.length);
        // const deals = await getDealDetails(foundedActiveDeals.map(deal => deal.id))
        const foundedPipelines1 = foundedActiveDeals.find(deal => deal.pipeline_id === 1);
        const foundedPipelines2 = foundedActiveDeals.find(deal => deal.pipeline_id === 2);
        const foundedPipelines3 = foundedActiveDeals.find(deal => deal.pipeline_id === 3);
  
        if (foundedPipelines1) {
          const newLabel = foundedPipelines1.label && !foundedPipelines1.label.includes(label) ? foundedPipelines1.label + `, ${label}` : label;
          // console.log("found active deals Pipeline 1", foundedPipelines1.id );
          const body = {label: newLabel};
          const notesBody = {deal_id: foundedPipelines1.id, content};
          const activitiesBody = {deal_id: foundedPipelines1.id, note: content};
          const editedDeal = await editDeal(foundedPipelines1.id, body);
          const newNote = await addNote(notesBody);
          const newActivities = await addActivities(activitiesBody);
        }
        if (foundedPipelines2) {
          // console.log("found active deals Pipeline 2");
          const newLabel = foundedPipelines2.label && !foundedPipelines2.label.includes(label) ? foundedPipelines2.label + `, ${label}` : label;
          const body = {pipeline_id: 1, label: newLabel};
          const notesBody = {deal_id: foundedPipelines2.id, content};
          const activitiesBody = {deal_id: foundedPipelines2.id, note: content};
          const editedDeal = await editDeal(foundedPipelines2.id, body); 
          const newActivities = await addActivities(activitiesBody); 
          const newNote = await addNote(notesBody);
        }
        if (foundedPipelines3) {
          // console.log("found active deals Pipeline 3");
          const newLabel = foundedPipelines3.label && !foundedPipelines3.label.includes(label) ? foundedPipelines3.label + `, ${label}` : label;
          const body = {label: newLabel};
          const notesBody = {deal_id: foundedPipelines3.id, content};
          const activitiesBody = {deal_id: foundedPipelines3.id, note: content};
          const editedDeal = await editDeal(foundedPipelines3.id, body); 
          const newActivities = await addActivities(activitiesBody);
          const newNote = await addNote(notesBody); 
        }

    } else {  
    if (foundedClosedDeals.length) {
      // console.log("found closed deals", foundedClosedDeals.length);
      const dealId = foundedClosedDeals[0].id;
      // console.log("id", dealId);
      const newLabel = foundedClosedDeals[0].label && !foundedClosedDeals[0].label.includes(label) ? foundedClosedDeals[0].label + `, ${label}` : label;
      const body = {title, status: "open", pipeline_id: 1, person_id: personsId, label: newLabel};
      if (utm_source) body["9866a4195e069161f192f563c269b463b4ea0688"] = utm_source;
      if (utm_medium) body["ce4db30445a2acfb1593b51034ff9f303e679926"] = utm_medium;
      if (utm_campaign) body["50966a75b48a959f8fdff6d001e46b78d2778bd2"] = utm_campaign;
      if (utm_term) body["d0503ee8929b0158e144aa74e818c1683152609a"] = utm_term;
      if (utm_content) body["0b9b6f42c6ea10f8cd5e6d54463dbfecf6e7c2bf"] = utm_content;
      const oldActivities = await getActivities(dealId);
      const oldNotes = await getNotes(foundedClosedDeals[0].id);
      const newDeal = await duplicateDeal(foundedClosedDeals[0].id);
      const editedDeal = await editDeal(newDeal.id, body);      
      if (oldActivities && oldActivities.length) {
      for (let i = 0; i < oldActivities.length; i++) {
      const { due_date, type, subject, done} = oldActivities[i];
      const activitiesBody = {deal_id: newDeal.id, person_id: personsId, due_date, type, subject, done};
      const newActivities = await addActivities(activitiesBody);
      }
      }
      if (oldNotes && oldNotes.length) {
      for (let i = 0; i < oldNotes.length; i++) {
      const { add_time, content} = oldNotes[i];
      const notesBody = { deal_id: newDeal.id, add_time, content };
      const newNote = await addNote(notesBody);
      }
      }
      const notesBody = {deal_id: newDeal.id, content};
      const newNote = await addNote(notesBody);
    }
    }
  } else {  
    // console.log("Deals not found");
    const body = {person_id: personsId, title, pipeline_id: 1, label};
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