import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Dashboard from './components/Dashboard.jsx';

const App = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredWeatherData, setFilteredWeatherData] = useState([]);
  const [temperatureUnit, setTemperatureUnit] = useState('Celsius');
  const [sunTime, setSunTime] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('');
  const [MaxTemp, setMaxTemp] = useState('');
  const [mostCommonWeatherCondition, setMostCommonWeatherCondition] = useState('');
  const [AvgTemperature, setAvgTemperature] = useState('');

  const fetchWeather = async () => {
    const locations = [
      { lat: 40.7128, lon: -74.0060 },
      { lat: 34.052235, lon: -118.243683 },
      { lat: 55.7558, lon: 37.6173 },
      { lat: 48.8566, lon: 2.3522 },
      { lat: 41.390205, lon: 2.154007 },
      { lat: 45.2859, lon: 6.5848 },
      { lat: 13.7563, lon: 100.5018 },
      { lat: -37.8136, lon: 144.9631 },
      { lat: 18.50012, lon: -69.98857 },
      { lat: 51.5072, lon: -0.1276},
    ];
    try {
      const responses = await Promise.all(
        locations.map(location =>
          axios.get('https://api.weatherbit.io/v2.0/current', {
            params: {
              lat: location.lat,
              lon: location.lon,
              key: 'cc000e3d92964cffb04255f751fc1a69',
            },
          })
        )
      );
      const weatherData = responses.map(response => response.data.data).flat();
      setWeatherData(weatherData);
      setFilteredWeatherData(weatherData);
      calculateAttributes(weatherData);
    } catch (error) {
      console.error(error);
    }
  };
  
  const calculateAttributes = (weatherData) => {
    if (!weatherData || weatherData.length === 0) {
      return;
    }
  
    let sumTemperature = 0;
    let maxTemperature = -Infinity;
    const conditionCount = {};
  
    weatherData.forEach(weather => {
      const temperature = parseFloat(weather.temp);
      sumTemperature += temperature;
      maxTemperature = Math.max(maxTemperature, temperature);
      conditionCount[weather.weather.description] = (conditionCount[weather.weather.description] || 0) + 1;
    });
  
    const avgTemperature = sumTemperature / weatherData.length;
    const roundedAvgTemperature = `${avgTemperature.toFixed(2)}°C / ${celsiusToFahrenheit(avgTemperature)}`;
    const mostCommonWeatherCondition = Object.keys(conditionCount).reduce((a, b) => (conditionCount[a] > conditionCount[b] ? a : b), '');
  
    setMaxTemp(`${maxTemperature.toFixed(2)}°C / ${celsiusToFahrenheit(maxTemperature)}`);
    setAvgTemperature(roundedAvgTemperature);
    setMostCommonWeatherCondition(mostCommonWeatherCondition);
  };
  
  useEffect(() => {
    fetchWeather();
  }, []);

  const findMaxTemp = (data) => {
    let max = -Infinity;
    data.forEach(item => {
      const temp = parseFloat(item.temp);
      if (!isNaN(temp)) {
        max = Math.max(max, temp);
      }
    });
    return max;
  };

  const handleSearch = (event) => {
    const searchText = event.target.value.toLowerCase();
    setSearch(searchText); 
    const filteredData = weatherData.filter(item =>
      item.city_name.toLowerCase().includes(searchText)
    );
    setFilteredWeatherData(filteredData);
  };

  const handleUnitChange = (event) => {
    setTemperatureUnit(event.target.value);
  };

  const handleSunTimeChange = (event) => {
    setSunTime(event.target.value);
  };

  const handleWeatherConditionChange = (event) => {
    setWeatherCondition(event.target.value);
  };
  
  const formatTime12Hour = (time24Hour) => {
    const [hours, minutes] = time24Hour.split(':');
    let period = 'AM';
    let hours12 = parseInt(hours, 10);
    
    hours12 -= 4;
    
    if (hours12 < 0) {
      hours12 += 12;
      period = 'PM';
    } else if (hours12 >= 12) {
      period = 'PM';
      hours12 = hours12 === 12 ? 12 : hours12 - 12;
    } else if (hours12 === 0) {
      hours12 = 12;
    }
  
    return `${hours12}:${minutes} ${period}`;
  };
  
  const celsiusToFahrenheit = (celsius) => {
    const fahrenheit = (celsius * 9/5) + 32;
    return `${fahrenheit.toFixed(2)}°F`;
  };

  const renderWeatherData = () => {
    return filteredWeatherData.map(item => {
      const condition = item.weather.description.toLowerCase();
      if ((weatherCondition === '' || condition.includes(weatherCondition.toLowerCase())) &&
          (sunTime === '' || sunTime === 'Sunrise' || sunTime === 'Sunset')) {
        return (
          <div className='weather-card' key={item.city_name}>
            <img src={`https://source.unsplash.com/300x200/?${item.city_name}`} alt={item.city_name} />
            <h3>{item.city_name}</h3>
            <p>Temperature: {temperatureUnit === 'Celsius' ? `${item.temp.toFixed(2)}°C` : celsiusToFahrenheit(item.temp)}</p>
            {sunTime === '' || sunTime === 'Sunrise' ? <p>Sunrise: {formatTime12Hour(item.sunrise)}</p> : null}
            {sunTime === '' || sunTime === 'Sunset' ? <p>Sunset: {formatTime12Hour(item.sunset)}</p> : null}
            <p>Condition: {item.weather.description}</p>
          </div>
        );
      } else {
        return null;
      }
    });
  };  

  return (
    <div>
      <h1>Weather Platform</h1>
      <Dashboard 
        weatherData={weatherData}
        MaxTemp={MaxTemp} 
        mostCommonWeatherCondition={mostCommonWeatherCondition}
        AvgTemperature={AvgTemperature}
        temperatureUnit={temperatureUnit}
      />
      <div className='search-filter'>
        <input
          type='text'
          placeholder='Search by location'
          value={search}
          onChange={handleSearch}
        />
        <div className='temperature-filter'>
          <label htmlFor='temperature-unit'>Temperature Unit:</label>
          <select id='temperature-unit' value={temperatureUnit} onChange={handleUnitChange}>
            <option value='Celsius'>Celsius</option>
            <option value='Fahrenheit'>Fahrenheit</option>
          </select>
        </div>
        <div className='sun-time-filter'>
          <label htmlFor='sun-time'>Sunrise/Sunset Time:</label>
          <select id='sun-time' value={sunTime} onChange={handleSunTimeChange}>
            <option value=''>All</option>
            <option value='Sunrise'>Sunrise</option>
            <option value='Sunset'>Sunset</option>
          </select>
        </div>
        <div className='weather-condition-filter'>
          <label htmlFor='weather-condition'>Weather Condition:</label>
          <select id='weather-condition' value={weatherCondition} onChange={handleWeatherConditionChange}>
            <option value=''>All</option>
            <option value='Clear'>Clear</option>
            <option value='Clouds'>Clouds</option>
            <option value='Rain'>Rain</option>
            <option value='Snow'>Snow</option>
          </select>
        </div>
      </div>
  
      <div className='weather-container'>
        {renderWeatherData()}
      </div>
    </div>
  );
  
  
};

export default App;

