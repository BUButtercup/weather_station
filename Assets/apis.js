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
console.log(stateArr);

function createCityBtn(){
    console.log('CB', cityData)
    for (let i=0; i<cityData.length; i++){
        let thisCity = cityData[i];
        let lat = thisCity.cityLat;
        let long = thisCity.cityLong;
        let name = thisCity.name;
        let cityBtn = document.createElement('button');
        cityBtn.setAttribute('class', 'cityBtn');
        // cityBtn.onclick = getWeather(lat, long, name);
        cityBtn.textContent = name;
        console.log('createBtn', name)
        storedCities.appendChild(cityBtn);
    }
}

async function start(){
    whichCity.setAttribute('style', 'display: none');
    cityData = JSON.parse(localStorage.getItem('storedCityData')) 
    if (cityData == undefined) {
        cityData = [];
        return false;
    } else { createCityBtn()}
    console.log(cityData);
    // let cityBtns = $('.cityBtn');
}
// console.log(stateArr);

function storeCity(obj){
    // for (let i=0; i<cityData.length; i++){
    //     if (cityData[i].cityLat !== thisCity.cityLat){
    //         cityData.push(thisCity);
    //     } else if (cityData[i].cityLong !== thisCity.cityLong){
    //         cityData.push(thisCity);
    //     } else {return}
    // }
    // console.log('cityData Array: ', cityData);
    cityData.push(obj);
    localStorage.setItem('storedCityData', JSON.stringify(cityData));
    console.log('cityData Array2: ', cityData);
    let newCityBtn = () =>{
        let createBtn = document.createElement('button');
        createBtn.setAttribute('class', 'cityBtn');
        createBtn.textContent = currentCity;
        console.log(currentCity)
        storedCities.appendChild(createBtn);
    };
    newCityBtn();
    $('#cityInpt').val('');
    $('#which').empty('option');
    whichCity.setAttribute('style', 'display: none');
}

function getCityLoc(){
    cityInpt = $('#cityInpt').val();
    stateInpt = $('.stateOpt:selected').val();
    let locData = [];
    console.log(stateInpt);
    if (stateInpt === undefined){
        geocodeURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInpt}&limit=5&appid=${geoApiKey}`
        console.log(geocodeURL)

        fetch(geocodeURL)
            .then(function(response) {
                return response.json();
            })
            .then(function(data){
                locData.push(data);
                console.log(data);
                console.log(locData);
                whichOne(locData).then(getValue)
                return
            })
    } else {
    geocodeURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInpt},${stateInpt},US&limit=1&appid=${geoApiKey}`;
    console.log('exact choice');
    
    fetch(geocodeURL)
        .then(function(response) {
            return response.json();
        })
        .then(function(data){
            locData.push(data);
            console.log(data);
            getWeather(data[0].lat, data[0].lon)
        });
    };
}

async function whichOne(arr){
    let locsUS = [];
    let locsNUS = [];
    for (let i=0; i<arr[0].length; i++){
        if (arr[0][i].country === 'US'){
            console.log('in the US')
            locsUS.push(arr[0][i]);
        } else {
            console.log('International');
            locsNUS.push(arr[0][i])
        }
    }
    console.log('locsUS: ', locsUS);
    console.log('locsNUS: ', locsNUS);
    //creating pop-in choice selector//

    whichCity.setAttribute('name', 'which');
    whichCity.setAttribute('id', 'which');
    whichCity.setAttribute('style', 'display: block');
    // whichCity.setAttribute('onchange', 'getValue(this.id)')
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
    console.log(val);

    function chooseLoc(url){
        console.log(url);
        fetch(url)
            .then(function(response) {
                return response.json();
            })
            .then(function(data){
                console.log(data);
                console.log(data[0].lat, data[0].lon);
                getWeather(data[0].lat, data[0].lon);
            });
    }

    async function chooseState(val){
        stateInpt = val
        geocodeURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInpt},${stateInpt}&limit=1&appid=${geoApiKey}`;
        console.log(geocodeURL);
        chooseLoc(geocodeURL);
    } 

    async function chooseCountry(val){
        countryInpt = val
        geocodeURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityInpt},${countryInpt}&limit=1&appid=${geoApiKey}`;
        console.log(geocodeURL);
        chooseLoc(geocodeURL);
    }

    let splitVal = val.split('-');
    console.log(splitVal);
    if (splitVal[0] == 'US'){
        console.log('US', splitVal[0]);
        chooseState(val);
    } else {
        (console.log('Int', val))
        chooseCountry(val)
    }
}


function getWeather(lat, long, city){
    console.log('made it!');
    let weatherUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${long}&units=imperial&appid=${geoApiKey}`
    console.log('weatherURL', weatherUrl);

    fetch(weatherUrl)
        .then(function(response) {
            return response.json();
        })
        .then(function(data){
            console.log('city fetch data: ', data);

            //current day box
            currentCity = cityInpt || city;
            if (currentCity === city){console.log('city', city)}///////
            cityH2.textContent = currentCity + currentDay;
            let weatherData = [currentCity, 'Temp: ' + data.current.temp + '\u00B0F', 'Wind: ' + data.current.wind_speed + 'mph', 'Humidity: ' + data.current.humidity + '%', 'UV Index: ' + data.current.uvi];
            console.log('weatherData from getWeather', weatherData);
            todayList.innerHTML = '';
            for (let i=0; i<weatherData.length; i++){
                let createLi = document.createElement('li');
                createLi.textContent = weatherData[i];
                todayList.appendChild(createLi);
            }
            let thisCity = {
                name: cityInpt || city,
                cityLat: lat,
                cityLong: long
            }
            // console.log('thisCity: ', thisCity)
            // console.log('cityData Array: ', cityData);
            // console.log('cityData length', cityData.length)
////////////////////////////////////////
            if (cityData.length == 0) {
                console.log('2cityData length', cityData.length)
                storeCity(thisCity);
                console.log('array empty, stored')
            }
            for (let i=0; i<cityData.length; i++){
                 if (thisCity.name !== cityData[i].name){
                    storeCity(thisCity)
                    console.log('city not in array, stored')
                } else {
                    return false
                }
            }


            //5day forcast boxes

            let dailyData = data.daily
            let futData = [];

            for (let i=0; i<5; i++){
                let fDayTemp = 'Temp: ' + dailyData[i].temp.day;
                let fDayWind = 'Wind: ' + dailyData[i].wind_speed;
                let fDayHum = 'Humidity: ' + dailyData[i].humidity;
                let futObj = {
                    temp: fDayTemp,
                    wind: fDayWind,
                    humidity: fDayHum
                }
                futData.push(futObj);
            }
            console.log(futData)

            let fdBox1 = document.getElementById('0');
            let fdBox2 = document.getElementById('1');;
            let fdBox3 = document.getElementById('2');;
            let fdBox4 = document.getElementById('3');;
            let fdBox5 = document.getElementById('4');;
            let fDayBoxes = [fdBox1, fdBox2, fdBox3, fdBox4, fdBox5];
            
            function set5Day(i){
                let newTLI = document.createElement('li');
                let newWLI = document.createElement('li');
                let newHLI = document.createElement('li');
                newTLI.textContent = futData[i].temp;
                newWLI.textContent = futData[i].wind;
                newHLI.textContent = futData[i].humidity;
                fDayBoxes[i].appendChild(newTLI);
                fDayBoxes[i].appendChild(newWLI);
                fDayBoxes[i].appendChild(newHLI);
            }
            for (let i=0; i<fDayBoxes.length; i++){
                console.log('yes');
                fDayBoxes.innerHTML = '';
                set5Day(i);
            }


            // for (let i=0; i<cityData.length; i++){
            //    if (thisCity.name !== cityData[i].name){
            //         cityData.push(thisCity);
            //         console.log('cityData', cityData);
            //     } else {return}
            // }
            

            // if (storedCities.innerHTML = ''){
            //     storeCity()
    //         } else {
    //             for(let i = 0; i<cityBtn.length; i++){
    //             console.log(cityBtn[i].innerText)
    //             if (cityBtn.innerText !== currentCity){
    //                 storeCity()
    //             } else { return}
    //             }
        //    } 
    });
}



// storedCities.addEventListener('click', function(event){
//     if (event.target.matches('li') === true){
//         let city = event.target.innerText;
//         console.log(city);
//         getWeather(city);
//     }
// });


submitBtn.addEventListener('click', function(event){
    event.preventDefault();
    // getWeather(document.querySelector('input').value);
    getCityLoc();
    // storeCity();
});

$('#clearsrch').on('click', function(event){
    event.preventDefault();
    $('#cityInpt').val('');
    $('#which').empty('option');
    whichCity.setAttribute('style', 'display: none');
});

$('#clearbtns').on('click', function(event){
    event.preventDefault();
    localStorage.clear();
    $('#stored-cities').html('');
    cityData = [];
})

$('#stored-cities').on('click', function(event){
    event.preventDefault();
    console.log('yes!')
    let thisBtn = event.target;
    if (thisBtn == button){
        cityData.forEach(function(i){
            if (cityData[i].name === thisBtn.textContent){
                console.log('working')
            }
        })
    }
})

start();
stateSelector();
