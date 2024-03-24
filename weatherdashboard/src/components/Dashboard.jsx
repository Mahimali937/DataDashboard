import React, { useEffect, useState } from "react";

function WeatherDashboard({ AvgTemperature, mostCommonWeatherCondition, MaxTemp}) {
  return (
    <div className='dashboard'>
      <div className='average-temperature'>
        <h2>Average Temperature:</h2>
        <p>{AvgTemperature}</p>
      </div>
      <div className='common-weather-condition'>
        <h2>Most Common Weather Condition:</h2>
        <p>{mostCommonWeatherCondition}</p>
      </div>
      <div className='max-temperature'>
        <h2>Maximum Temperature:</h2>
        <p>{MaxTemp}</p>
      </div>
    </div>
  );
}

export default WeatherDashboard;

