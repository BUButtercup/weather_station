
let dateToday = $('#datebox');
let f5DateBox = $('.futdate');

const today = moment();
let currentDay = today.format('(MM/DD/YY)')
$(dateToday).text(currentDay);

for (let i=0; i<f5DateBox.length; i++){                         ///populating dates in 5 day forcast
    let futDate = moment().add(i + 1, 'd').format('MM/DD/YY');
    f5DateBox[i].textContent = futDate;
}



