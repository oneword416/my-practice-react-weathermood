import React from 'react';
import PropTypes from 'prop-types';

import WeatherDisplay from 'components/WeatherDisplay.jsx';
import WeatherTable from 'components/WeatherTable.jsx';
import WeatherForm from 'components/WeatherForm.jsx';
import {getForecast} from 'api/open-weather-map.js';
import {getWeatherByCoord} from 'api/open-weather-map.js';

import './weather.css';
import './Forecast.css';

import { withScriptjs, withGoogleMap, GoogleMap, Marker } from "react-google-maps"
import _, {debounce} from 'lodash';

const MyMapComponent = withScriptjs(withGoogleMap((props) =>
    <GoogleMap
        defaultZoom={8}
        defaultCenter={{ lat: -34.397, lng: 150.644 }}
        center = {{ lat: props.coords.lat, lng: props.coords.lng }}
        onClick={ debounce((e) => {props.onMapClick(e)}, 1000) }
        >
        {props.isMarkerShown && <Marker position={{ lat: props.coords.lat, lng: props.coords.lng }} />}
    </GoogleMap>
))

export default class Forecast extends React.Component {
    static propTypes = {
        masking: PropTypes.bool,
        group: PropTypes.string,
        description: PropTypes.string,
        temp: PropTypes.number,
        unit: PropTypes.string,
        listOfWeek: PropTypes.array,
    };

    static getInitWeatherState() {
        return {
            city: 'na',
            code: -1,
            group: 'na',
            description: 'N/A',
            temp: NaN,
            listOfWeek: []
        };
    };

    constructor(props) {
        super(props);

        this.state = {
            ...Forecast.getInitWeatherState(),
            loading: true,
            masking: true,
            coords: { lat: 0, lng: 0}
        };

        this.handleFormQuery = this.handleFormQuery.bind(this);
        this.showPosition = this.showPosition.bind(this);
        this.handleMapClick = this.handleMapClick.bind(this);
    }

    componentDidMount() {
        //this.getWeather('Hsinchu', 'metric');
        this.getLocation();
    }

    componentWillUnmount() {
        // if (this.state.loading) {
        //     cancelWeather();
        // }
    }

    getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.showPosition);
        } else { 
            console.log("Geolocation is not supported by this browser.");
        }
    }
    
    showPosition(position) {
        console.log("Latitude: " + position.coords.latitude + 
        "<br>Longitude: " + position.coords.longitude);
        this.getWeatherByCoord(position.coords.latitude, position.coords.longitude, 'metric')
        this.setState({coords: {lat: position.coords.latitude, lng: position.coords.longitude}});
    }

    render() {
        return (
            <div className='forecast'>
                <MyMapComponent 
                    isMarkerShown
                    googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
                    loadingElement={<div style={{ height: `100%` }} />}
                    containerElement={<div style={{ height: `700px` }} />}
                    mapElement={<div style={{ height: `100%` }} />}
                    onMapClick={this.handleMapClick}
                    coords = {this.state.coords}
                />
                <WeatherDisplay {...this.state}/>
                <WeatherTable {...this.state}/>
            </div>
        );
    }

    getWeather(city, unit) {
        this.setState({
            loading: true,
            masking: true,
            city: city // set city state immediately to prevent input text (in WeatherForm) from blinking;
        }, () => { // called back after setState completes
            getForecast(city, unit).then(weather => {
                this.setState({
                    ...weather,
                    loading: false
                }, () => this.notifyUnitChange(unit));
            }).catch(err => {
                console.error('Error getting weather', err);

                this.setState({
                    ...Today.getInitWeatherState(unit),
                    loading: false
                }, () => this.notifyUnitChange(unit));
            });
        });

        setTimeout(() => {
            this.setState({
                masking: false
            });
        }, 600);
    }

    getWeatherByCoord(lat, lng, unit) {
        this.setState({
            loading: true,
            masking: true,     
        }, () => {
            getForecast(lat, lng, unit).then(weather => {
                this.setState({
                    ...weather,
                    loading: false
                }, () => this.notifyUnitChange(unit));                
            }).catch(err => {
                console.error('Error getting weather', err);
                
                this.setState({
                    ...Today.getInitWeatherState(unit),
                    loading: false
                }, () => this.notifyUnitChange(unit));
            });
        });
        setTimeout(() => {
            this.setState({
                masking: false
            });
        }, 600);
    }

    handleFormQuery(city, unit) {
        this.getWeather(city, unit);
    }

    notifyUnitChange(unit) {
        if (this.props.units !== unit) {
            this.props.onUnitChange(unit);
        }
    }

    handleMapClick(e) {
        this.getWeatherByCoord(e.latLng.lat(), e.latLng.lng(), 'metric')
    }
}