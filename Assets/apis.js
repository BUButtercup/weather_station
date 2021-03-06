let submitBtn = document.querySelector('button');
let todayList = document.querySelector('#currentCity');
let cityH2 = document.querySelector('#current');
let storedCities = document.querySelector('#stored-cities');
let cityBtn = document.querySelectorAll('.cityBtn');
let whichCity = document.getElementById('which');
let cityData = [];
let currentCity;
let cityInpt;
let stateInpt;
let countryInpt;
let geocodeURL;

let weatherApiKey = '667a1f0cc880fb242f3389d68472b7f4';

let geoApiKey = 'f300818919fd837b1f1bf9f92c6230f2'

//getting state values and populating state selector//
let states = [['AK', 'Alaska'], ['AL', 'Alabama'], ['AR', 'Arkansas'], ['AZ', 'Arizona'], ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['IA', 'Iowa'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['MA','Massachusetts'], ['MD', 'Maryland'], ['ME', 'Maine'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MO', 'Missouri'], ['MS', 'Mississippi'], ['MT', 'Montana'], ['NC', 'North Carolina'], ['ND', 'North Dakota'],  ['NE', 'New England'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NV', 'Nevada'], ['NY', 'New York'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VA', 'Virginia'], ['VT', 'Vermont'], ['WA', 'Washington'], ['WI', 'Wisconsin'], ['WV', 'West Virginia'], ['WY', 'Wyoming']]
let stateArr = [];

function stateSelector(){
    function makeArr(){
        for (let i=0; i<states.length; i++){
            let stateObj = states[i]
            let stateCode = "US-" + states[i][0];
            let statePair = {
                code: stateCode,
                name: stateObj[0],
                fullName: stateObj[1]
            }
            stateArr.push(statePair);
        }
    }
    makeArr();
    for (let i=0; i<stateArr.length; i++){                          ///populating state selector
        let newOption = document.createElement('option');
        newOption.textContent = stateArr[i].name;
        newOption.setAttribute('value', stateArr[i].code);
        newOption.setAttribute('class', 'stateOpt')
        document.querySelector('#state').appendChild(newOption);
    }
}

function createCityBtn(){
    for (let i=0; i<cityData.length; i++){
        let thisCity = cityData[i];
        let name = thisCity.name;
        let cityBtn = document.createElement('button');
        cityBtn.setAttribute('class', 'cityBtn');
        cityBtn.textContent = name;
        storedCities.appendChild(cityBtn);
    }
}

async function start(){
    whichCity.setAttribute('style', 'display: none');
    cityData = JSON.parse(localStorage.getItem('storedCityData')) 
    if (cityData == undefined) {
        cityData = [];
        return false;
    } else if (cityData.length >= 10){
        cityData.splice(10);
        createCityBtn();
    } else {createCityBtn()}
}

function storeCity(obj){
    cityData.push(obj);
    localStorage.setItem('storedCityData', JSON.stringify(cityData));
    let newCityBtn = () =>{
        let createBtn = document.createElement('button');
        createBtn.setAttribute('class', 'cityBtn');
        createBtn.textContent = currentCity;
        storedCities.appendChild(createBtn);
    };
    newCityBtn();
    $('#cityInpt').val('');
    $('#which').empty('option');
    whichCity.setAttribute('style', 'display: none');
}

function getCityLoc(){
    cityInpt = $('#cityInpt').val();
    let capCityInput = (inpt => {
        let finalCity = '';
        let letters = (inpt.toLowerCase()).split('');
        let firstLetter = (letters.shift()).toUpperCase();
        finalCity = finalCity+=firstLetter
        letters.forEach(letter=>finalCity+=letter);
        cityInpt = finalCity
    });
    capCityInput(cityInpt);
    
    stateInpt = $('.stateOpt:selected').val();
    let locData = [];
    if (stateInpt === undefined){
        geocodeURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInpt}&limit=5&appid=${geoApiKey}`
        console.log(geocodeURL)

        fetch(geocodeURL)
            .then(function(response) {
                if (response.status > 200){
                    $('#cityInpt').val('')
                    $( "#dialog-message2" ).dialog({
                          modal: true,
                          buttons: {
                            Ok: function() {
                              $( this ).dialog( "close" );
                            }
                          }
                    });
                } else {
                return response.json();
                }
            })
            .then(function(data){
                if (data.length === 0){
                    $( "#dialog-message2" ).dialog({
                          modal: true,
                          buttons: {
                            Ok: function() {
                              $( this ).dialog( "close" );
                            }
                          }
                    });
                    $('#cityInpt').val('');
                    return
                } else if (data.length === 1){
                    console.log(data)
                    locData.push(data);
                    getWeather(data[0].lat, data[0].lon)
                } else {
                    locData.push(data);
                    whichOne(locData).then(getValue)
                    return
                }
            })
    } else {
    geocodeURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInpt},${stateInpt},US&limit=1&appid=${geoApiKey}`;
    
    fetch(geocodeURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data){
            locData.push(data);
            getWeather(data[0].lat, data[0].lon)
            $('#state').find('option:eq(0)').attr('selected', true);
        });
    };
}

async function whichOne(arr){
    let locsUS = [];
    let locsNUS = [];
    for (let i=0; i<arr[0].length; i++){
        if (arr[0][i].country === 'US'){
            locsUS.push(arr[0][i]);
        } else {
            locsNUS.push(arr[0][i])
        }
    }

    //creating pop-in choice selector//
    whichCity.setAttribute('name', 'which');
    whichCity.setAttribute('id', 'which');
    whichCity.setAttribute('style', 'display: block');

    //creating first option for placeholder//
    let opt1 = document.createElement('option');
    opt1.setAttribute('value', '');
    opt1.textContent = '<--Which one??-->';
    whichCity.appendChild(opt1);
    //filling in other options with arrays//
        //US
    for (let i=0; i<locsUS.length; i++){
        let newValue;
        for (let j=0; j<stateArr.length; j++){
            if (locsUS[i].state === stateArr[j].fullName){
                newValue = stateArr[j].code;
            }
        }
        let newOpt = document.createElement('option');
        newOpt.setAttribute('value', newValue);
        newOpt.setAttribute('class', 'newOpt1');
        newOpt.textContent = `${locsUS[i].name}, ${locsUS[i].state}`;
        whichCity.appendChild(newOpt);
    }
        //Int
    for (let i=0; i<locsNUS.length; i++){
        let newValue = locsNUS[i].country
        let newOpt = document.createElement('option');
        newOpt.setAttribute('value', newValue);
        newOpt.setAttribute('class', 'newOpt2');
        if (!locsNUS[i].state){
            newOpt.textContent = `${locsNUS[i].name}, ${locsNUS[i].country}`;
        } else {
            newOpt.textContent = `${locsNUS[i].name}, ${locsNUS[i].state}, ${locsNUS[i].country}`;
        };
        whichCity.appendChild(newOpt);
    }
}

function getValue(val){
    function chooseLoc(url){
        fetch(url)
            .then(function(response) {
                return response.json();
            })
            .then(function(data){
                getWeather(data[0].lat, data[0].lon);
            });
    }

    async function chooseState(val){
        stateInpt = val
        geocodeURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInpt},${stateInpt}&limit=1&appid=${geoApiKey}`;
        chooseLoc(geocodeURL);
    } 

    async function chooseCountry(val){
        countryInpt = val
        geocodeURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInpt},${countryInpt}&limit=1&appid=${geoApiKey}`;
        chooseLoc(geocodeURL);
    }

    let splitVal = val.split('-');
    if (splitVal[0] == 'US'){
        chooseState(val);
    } else {
        chooseCountry(val)
    }
}


function getWeather(lat, long){
    let weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&units=imperial&appid=${geoApiKey}`
    console.log('weatherURL', weatherUrl);

    fetch(weatherUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data){
            console.log('city fetch data: ', data);

            //current day box
            currentCity = cityInpt;
            cityH2.textContent = currentCity;
            $('#date-box').text(currentDay);
            let weatherData = [currentCity, 'Temp: ' + data.current.temp + '\u00B0F', 'Wind: ' + data.current.wind_speed + 'mph', 'Humidity: ' + data.current.humidity + '%', 'UV Index: '];
            console.log('weatherData from getWeather', weatherData);
            todayList.innerHTML = '';
            for (let i=1; i<weatherData.length; i++){
                let createLi = document.createElement('li');
                createLi.setAttribute('class', 'list');
                createLi.textContent = weatherData[i];
                todayList.appendChild(createLi);
            }
             
            const currUVI = data.current.uvi
            const uvLI= todayList.lastElementChild;
            uvLI.setAttribute('style', 'display:flex')
            const uvBox = document.createElement('div');
            uvBox.setAttribute('id', 'uvBox')
            uvBox.textContent = currUVI
            const uvRec = document.createElement('li');
            uvRec.setAttribute('style', 'margin-left: 3rem; font-style: italic; font-size: 1rem')
            uvRec.setAttribute('id', 'uv-rec');
            if (currUVI <= 2){
                uvBox.setAttribute('style', 'background-color: green');
                uvRec.textContent = 'Low Risk of UV Damage: EPA recs include sunglasses in bright sun; those with sensitive skin cover up and use a sunscreen w/ SPF 30+'
                todayList.append(uvRec);
            } else if ((currUVI > 2) && (currUVI < 6)){
                uvBox.setAttribute('style', 'background-color: yellow');
                uvRec.textContent = 'Moderate Risk of UV Damage: EPA recs include avoiding sun at midday; when outdoors wear protective clothing, wide-brimmed hat, and UV-blocking sunglasses; generously apply SPF 30+ sunscreen every 2 hours, and after swimming or sweating'
                todayList.append(uvRec);
            } else if((currUVI > 5) && (currUVI < 8)){
                uvBox.setAttribute('style', 'background-color: orange');
                uvRec.textContent = 'High Risk of UV Damage: EPA recs include reduce time in sun between 10am and 4pm; when outdoors seek shade, wear protective clothing, wide-brimmed hat, and UV-blocking sunglasses; generously apply SPF 30+ sunscreen every 2 hours, and after swimming or sweating'
                todayList.append(uvRec);
            } else if ((currUVI > 7) && (currUVI < 11)){
                uvBox.setAttribute('style', 'background-color: red');
                uvRec.textContent = 'Very High Risk of UV Damage: EPA recs include reduce time in sun between 10am and 4pm; when outdoors seek shade, wear protective clothing, wide-brimmed hat, and UV-blocking sunglasses; generously apply SPF 30+ sunscreen every 2 hours, and after swimming or sweating'
                todayList.append(uvRec);
            } else {
                uvBox.setAttribute('style', 'background-color: purple');
                uvRec.textContent = 'Extreme Risk of UV Damage: EPA recs include avoiding time in sun between 10am and 4pm; when outdoors seek shade, wear protective clothing, wide-brimmed hat, and UV-blocking sunglasses; generously apply SPF 30+ sunscreen every 2 hours, and after swimming or sweating'
                todayList.append(uvRec);
            }
            uvLI.append(uvBox)
            
            //putting in icons//
            const currPicBox = document.getElementById('current-pic');
            currPicBox.setAttribute('style', 'display: flex; justify-content: center; align-items: center')
 
            let picSrc;
            const currPicCode = data.current.weather[0].icon;
            const getPic = code => {
                picSrc = `http://openweathermap.org/img/wn/${code}@2x.png`
            }
            getPic(currPicCode);
            let currPic = document.createElement('img');
            currPic.setAttribute('src', picSrc);
            currPic.setAttribute('id', 'current-img');
            currPicBox.appendChild(currPic);

            function packCity(){
                let thisCity = {
                    name: cityInpt,
                    cityLat: lat,
                    cityLong: long
                }
                if (cityData.length === 0) {
                    storeCity(thisCity);
                }
                let dataNames = [];
                for (let i=0; i<cityData.length; i++){
                    dataNames.push(cityData[i].name)
                }
                if (dataNames.includes(thisCity.name) !== true){
                    storeCity(thisCity)
                } else {return}
            }
            packCity();

            //5day forcast boxes
            let dailyData = data.daily
            let futData = [];
            for (let i=0; i<5; i++){
                let fDayTemp = 'Temp: ' + dailyData[i].temp.day;
                let fDayWind = 'Wind: ' + dailyData[i].wind_speed;
                let fDayHum = 'Humidity: ' + dailyData[i].humidity;
                let fDayPicCode = dailyData[i].weather[0].icon
                let futObj = {
                    temp: fDayTemp,
                    wind: fDayWind,
                    humidity: fDayHum,
                    imgSrc: `http://openweathermap.org/img/wn/${fDayPicCode}@2x.png`
                }
                futData.push(futObj);
            }

            let fdBox1 = document.getElementById('0');
            let fdBox2 = document.getElementById('1');;
            let fdBox3 = document.getElementById('2');;
            let fdBox4 = document.getElementById('3');;
            let fdBox5 = document.getElementById('4');;
            let fDayBoxes = [fdBox1, fdBox2, fdBox3, fdBox4, fdBox5];
 
            function set5Day(i){
                let newTLI = document.createElement('li');
                newTLI.setAttribute('class', 'list');
                let newWLI = document.createElement('li');
                newWLI.setAttribute('class', 'list');
                let newHLI = document.createElement('li');
                newHLI.setAttribute('class', 'list');
                newTLI.textContent = futData[i].temp;
                newWLI.textContent = futData[i].wind;
                newHLI.textContent = futData[i].humidity;
                let futPic = document.createElement('img');
                futPic.setAttribute('src', futData[i].imgSrc);
                futPic.setAttribute('class', 'fut-img');
                let picBox = fDayBoxes[i].previousElementSibling;
                picBox.setAttribute('style', 'display: flex; justify-content: center; align-items: center')
                picBox.appendChild(futPic)
                fDayBoxes[i].appendChild(newTLI);
                fDayBoxes[i].appendChild(newWLI);
                fDayBoxes[i].appendChild(newHLI);
            }
            for (let i=0; i<fDayBoxes.length; i++){
                fDayBoxes.innerHTML = '';
                set5Day(i);
            }
    });
}



$(submitBtn).on('click', function(event){
    event.preventDefault();
    if ($('#cityInpt').val() === ''){
        $( "#dialog-message" ).dialog({
              modal: true,
              buttons: {
                Ok: function() {
                  $( this ).dialog( "close" );
                }
              }
        });
        return
    }
    $('.fiveday').empty('li');
    $('.fut-pic').empty('img');
    $('#current-pic').empty('img');
    getCityLoc();
});

$('#state').on('keyup', function(event) {
    if (event.keyCode === 13){
      event.preventDefault();
      $(submitBtn).click();
    }
  })

$('#clearsrch').on('click', function(event){
    event.preventDefault();
    $('#cityInpt').val('');
    $('#which').empty('option');
    $('#state').find('option:eq(0)').attr('selected', true);
    whichCity.setAttribute('style', 'display: none');
});

$('#clearbtns').on('click', function(event){
    event.preventDefault();
    localStorage.clear();
    $('#stored-cities').html('');
    cityData = [];
})

$('#stored-cities').on('click', function(event){
    $(cityH2).text('');
    $('#cityInpt').val('');
    $('.fiveday').empty('li');
    $('.fut-pic').empty('img');
    $('#current-pic').empty('img');
    let thisBtn = event.target;
    if (thisBtn.matches("button") === true){
        for (let i=0; i<cityData.length; i++){
            if (cityData[i].name == thisBtn.textContent){
                let lat = cityData[i].cityLat;
                let long = cityData[i].cityLong;
                let name = cityData[i].name;
                cityInpt = name;
                getWeather(lat, long);
            }
        }
    }
})

start();
stateSelector();
