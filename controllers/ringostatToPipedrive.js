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

  const addOldData = async (oldId, newId, personsId) => {
    const oldActivities = await getActivities(oldId);
    const oldNotes = await getNotes(oldId);
    if (oldActivities && oldActivities.length) {
      for (let i = 0; i < oldActivities.length; i++) {
      const { due_date, type, subject, done} = oldActivities[i];
      const activitiesBody = {deal_id: newId, person_id: personsId, due_date, type, subject, done};
      const newActivities = await addActivities(activitiesBody);
      }
      }
      if (oldNotes && oldNotes.length) {
      for (let i = 0; i < oldNotes.length; i++) {
      const { add_time, content} = oldNotes[i];
      const notesBody = { deal_id: newId, add_time, content };
      const newNote = await addNote(notesBody);
      }
      }
  }

  const newDeal = async (req) => {
    const { body: {current: { id, person_id, title, person_name }} } = req;
      let personsId = '';
      let personName = '';
      let personPhone = '';
      let personEmail = '';
      let label = '44';
      let labelColor = '#F88FBE';
      let source = 'Call';
      let foundedPerson = [];
      let foundedDeals = [];
      if (/^\d{12}$/.test(title)) {
        // console.log(id, person_id, title);
        const oldActivities = await getActivities(id);
        if (oldActivities && oldActivities.length) {
          for (let i = 0; i < oldActivities.length; i++) {
            const { subject } = oldActivities[i];
            if (subject.includes("Прийнято") || subject.includes("Дзвінок") || subject.includes("Пропущений")) {
              source = 'InCall';
              label = '42';
              break;
            }
          }
        }
        if (label === '44') {
        for (let i = 0; i < oldActivities.length; i++) {
          const { subject } = oldActivities[i];
          if (subject.includes("Вихідний")) {
            source = 'OutCall';
            label = '43';  
            break;  
        }
      }
      }
        const countryCode = title.slice(0, 3);
        const operatorCode = title.slice(3, 5);
        const phoneNumber = title.slice(5);
        personPhone = `+${countryCode} (${operatorCode}) ${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 5)}-${phoneNumber.slice(5)}`;
        const foundedPersonPhone = await searchPerson(personPhone);
        
        if (foundedPersonPhone && foundedPersonPhone.length) {
          foundedPersonPhone.map(({ item: { id, phones, emails }}) => foundedPerson.push({ id, phones, emails }));
          const { id, phones, emails, name } = foundedPersonPhone[0].item;
          personsId = id;
          personPhone = phones[0];
          personEmail = emails[0];
          personName = name ? name : 'не зазначено';
        } else {
          personsId = person_id;
          const body = {};
          body.phone = personPhone;
          personName = person_name !== title ? person_name : 'не зазначено';
          // body.phone = [{ value: personPhone, primary: true, label: "mobile" }];
          const editedPerson = await editPerson(person_id, body);
        }
        
        let personIds = [];
        if (foundedPerson && foundedPerson.length) {
          personIds = foundedPerson.map(person => person.id);
          } else {
            personIds = [person_id];
          }
          const foundedDealsPerson = await searchAllDeals(personIds);
          
          if (foundedDealsPerson && foundedDealsPerson.length) {
            // console.log("found deals by persons", foundedDealsPerson.length);
            foundedDealsPerson.map(({ id }) => {
            if (!foundedDeals.includes(id)) foundedDeals.push(id);
          });
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
      // console.log(foundedDeals);
      const content = `<h2>Клієнт залишив повторну заявку на <span style='background-color: #ffffff; color: ${labelColor};'>${source}</span>&nbsp;&nbsp;&nbsp;</h2><div><table><caption><h3>Контактна інформація&nbsp;</h3></caption><tr><td>Імʼя:</td><td>${personName}&nbsp;</td></tr><tr><td>Телефон:</td><td>${personPhone}&nbsp;</td></tr>${personEmail ? `<tr><td>Email:</td><td>${personEmail}&nbsp;&nbsp;</td></tr>` : "&nbsp;&nbsp;"}</table></br>`;
      if (foundedDeals.length > 1) {
        if (foundedActiveDeals.length) {
          // console.log("found active deals", foundedActiveDeals.length);
          const foundedPipelines1 = foundedActiveDeals.find(deal => deal.pipeline_id === 1);
          const foundedPipelines2 = foundedActiveDeals.find(deal => deal.pipeline_id === 2);
          const foundedPipelines3 = foundedActiveDeals.find(deal => deal.pipeline_id === 3);
    
          if (foundedPipelines1) {
            // console.log("found active deals Pipeline 1", foundedPipelines1.id );
            const newLabel = foundedPipelines1.label && !foundedPipelines1.label.includes(label) ? foundedPipelines1.label + `, ${label}` : label;
            const body = {label: newLabel};
            const notesBody = {deal_id: foundedPipelines1.id, content};
            const activitiesBody = {deal_id: foundedPipelines1.id, note: content};
            const editedDeal = await editDeal(foundedPipelines1.id, body);
            await addOldData(id, foundedPipelines1.id, personsId)
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
            await addOldData(id, foundedPipelines2.id, personsId)
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
            await addOldData(id, foundedPipelines3.id, personsId);
            const newActivities = await addActivities(activitiesBody);
            const newNote = await addNote(notesBody); 
          }
  
        } else {
          if (foundedClosedDeals.length) {
            // console.log("found closed deals", foundedClosedDeals.length);
            const dealId = foundedClosedDeals[0].id; 
            const newLabel = foundedClosedDeals[0].label && !foundedClosedDeals[0].label.includes(label) ? foundedClosedDeals[0].label + `, ${label}` : label;
            const body = {title: source, status: "open", pipeline_id: 1, person_id: personsId, label: newLabel}; 
            const newDeal = await duplicateDeal(foundedClosedDeals[0].id);
            const editedDeal = await editDeal(newDeal.id, body); 
            await addOldData(id, newDeal.id, personsId);
            const notesBody = {deal_id: newDeal.id, content};
            const newNote = await addNote(notesBody);

          }
        }
        const body = {status: "lost", pipeline_id: 5}; 
        const editedDeal = await editDeal(id, body);
      } else {
        // console.log("Deals not found");
        const body = {title: source, pipeline_id: 1, person_id: personsId, label};
        const editedDeal = await editDeal(id, body);
      }
    } 
  }

  module.exports = {
    newDeal,
  };