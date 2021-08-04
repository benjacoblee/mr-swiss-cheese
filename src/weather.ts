// https://api.data.gov.sg/v1/environment/2-hour-weather-forecast
import axios from "axios";

export const getLocations = async () => {
  try {
    const res = await axios.get(
      "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast"
    );

    const locations = res.data.area_metadata.reduce((prev, curr) => {
      return [...prev, curr.name];
    }, []);

    return locations;
  } catch (err) {
    return err;
  }
};

export const getTwoHourForecast = async (location: string) => {
  try {
    const res = await axios.get(
      "https://api.data.gov.sg/v1/environment/2-hour-weather-forecast"
    );

    const forecasts = res.data.items[0].forecasts.reduce((prev, curr) => {
      const { area, forecast } = curr;
      const mutated = {
        area,
        forecast,
        forecastToFind: `/${area.replace(/ /g, "")}`,
      };

      return [...prev, mutated];
    }, []);

    const forecast = forecasts.find(
      (forecast) => forecast.forecastToFind === location
    );

    return forecast;
  } catch (err) {
    return err;
  }
};

export const getAllDayForecast = async () => {
  try {
    const res = await axios.get(
      "https://api.data.gov.sg/v1/environment/24-hour-weather-forecast"
    );

    const forecast = res.data.items[0].periods.reduce((prev, curr) => {
      if (!prev.today) {
        prev.today = curr;
      } else if (!prev.tonight) {
        prev.tonight = curr;
      }

      return prev;
    }, {});

    return forecast;
  } catch (err) {
    return err;
  }
};

export const getFourDayForecast = async () => {
  try {
    const res = await axios.get(
      "https://api.data.gov.sg/v1/environment/4-day-weather-forecast"
    );
    const forecasts = res.data.items[0].forecasts.reduce((prev, curr) => {
      const { timestamp, forecast } = curr;
      return [...prev, { timestamp, forecast }];
    }, []);

    return forecasts;
  } catch (err) {
    return err;
  }
};
