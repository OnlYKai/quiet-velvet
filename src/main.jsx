import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import * as zebar from 'zebar';
import SpotifyWidget from "./components/SpotifyWidget.jsx";
import GoogleSearch from "./components/GoogleSearch.jsx";
import Settings from "./components/Settings.jsx";
import Shortcut from "./components/Shortcut";
import config from "./config.js";
import moment from "moment";

const providers = zebar.createProviderGroup({
    keyboard: { type: 'keyboard' },
    network: { type: 'network' },
    glazewm: { type: 'glazewm' },
    cpu: { type: 'cpu' },
    date: { type: 'date', formatting: 'EEE d MMM t' },
    battery: { type: 'battery' },
    memory: { type: 'memory' },
    weather: { type: 'weather' },
    host: { type: 'host' }
});

createRoot(document.getElementById('root')).render(<App/>);

function App() {
    const [output, setOutput] = useState(providers.outputMap);
    const [showSpotifyWidget, setShowSpotifyWidget] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [showGoogleSearch, setShowGoogleSearch] = useState(true);
    const [showShortcuts, setShowShortcuts] = useState(true);
    const [dateFormat, setDateFormat] = useState(config.defaultTimeFormat);
    const [isFavorite, setIsFavorite] = useState(false);
    
    useEffect(() => {
        providers.onOutput(() => setOutput(providers.outputMap));
    }, []);

    // Disable right-click context menu
    useEffect(() => {
        const handleContextMenu = (event) => {
            event.preventDefault(); // Disable right-click context menu
        };

        // Attach the event listener
        document.addEventListener('contextmenu', handleContextMenu);

        // Clean up the event listener on unmount
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);


    
    const favorite = () => {
        setIsFavorite((prev) => !prev);
    }
    
    

    function getNetworkIcon(networkOutput) {
        switch (networkOutput.defaultInterface?.type) {
            case 'ethernet':
                return <i className="nf nf-md-ethernet_cable"></i>;
            case 'wifi':
                if (networkOutput.defaultGateway?.signalStrength >= 80) {
                    return <i className="nf nf-md-wifi_strength_4"></i>;
                } else if (
                    networkOutput.defaultGateway?.signalStrength >= 65
                ) {
                    return <i className="nf nf-md-wifi_strength_3"></i>;
                } else if (
                    networkOutput.defaultGateway?.signalStrength >= 40
                ) {
                    return <i className="nf nf-md-wifi_strength_2"></i>;
                } else if (
                    networkOutput.defaultGateway?.signalStrength >= 25
                ) {
                    return <i className="nf nf-md-wifi_strength_1"></i>;
                } else {
                    return <i className="nf nf-md-wifi_strength_outline"></i>;
                }
            default:
                return (
                    <i className="nf nf-md-wifi_strength_off_outline"></i>
                );
        }
    }
    
    function getBatteryIcon(batteryOutput) {
        if (batteryOutput.chargePercent > 90)
            return <i className="nf nf-fa-battery_4"></i>;
        if (batteryOutput.chargePercent > 70)
            return <i className="nf nf-fa-battery_3"></i>;
        if (batteryOutput.chargePercent > 40)
            return <i className="nf nf-fa-battery_2"></i>;
        if (batteryOutput.chargePercent > 20)
            return <i className="nf nf-fa-battery_1"></i>;
        return <i className="nf nf-fa-battery_0"></i>;
    }

    function getWeatherIcon(weatherOutput) {
        switch (weatherOutput.status) {
            case 'clear_day':
                return <i className="nf nf-weather-day_sunny"></i>;
            case 'clear_night':
                return <i className="nf nf-weather-night_clear"></i>;
            case 'cloudy_day':
                return <i className="nf nf-weather-day_cloudy"></i>;
            case 'cloudy_night':
                return <i className="nf nf-weather-night_alt_cloudy"></i>;
            case 'light_rain_day':
                return <i className="nf nf-weather-day_sprinkle"></i>;
            case 'light_rain_night':
                return <i className="nf nf-weather-night_alt_sprinkle"></i>;
            case 'heavy_rain_day':
                return <i className="nf nf-weather-day_rain"></i>;
            case 'heavy_rain_night':
                return <i className="nf nf-weather-night_alt_rain"></i>;
            case 'snow_day':
                return <i className="nf nf-weather-day_snow"></i>;
            case 'snow_night':
                return <i className="nf nf-weather-night_alt_snow"></i>;
            case 'thunder_day':
                return <i className="nf nf-weather-day_lightning"></i>;
            case 'thunder_night':
                return <i className="nf nf-weather-night_alt_lightning"></i>;
        }
    }

    const hrefStyle = {
        textDecoration: 'none',
        color: 'var(--font-color)',
    }
    const bigIcons = {
        fontSize: '15px',
        paddingTop: '0px',
        paddingBottom: '0px',
    }
    
    return (
        <div className="app">
            <div className="left">
                <div className="box">
                    <div className="logo">
                        <i className="nf nf-custom-windows" style={bigIcons}></i>
                        {output.host?.hostname} | {output.host?.friendlyOsVersion}
                    </div>
                    {output.glazewm && (
                        <div className="workspaces">
                            {output.glazewm.currentWorkspaces.map(workspace => (
                                <button
                                    className={`workspace ${workspace.hasFocus && 'focused'} ${workspace.isDisplayed && 'displayed'}`}
                                    onClick={() =>
                                        output.glazewm.runCommand(
                                            `focus --workspace ${workspace.name}`,
                                        )
                                    }
                                    key={workspace.name}
                                >
                                    {workspace.displayName ?? workspace.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {showShortcuts && output.glazewm ? <div className="workspaces">
                    <Shortcut commandRunner={output.glazewm.runCommand}
                              commands={[
                                  'focus --workspace 1',
                                  `shell-exec ${config.terminalPath}`
                              ]}
                              iconClass="nf-cod-terminal_powershell" name="Terminal"
                    />
                </div> : null}
            </div>
            
            <div className="center">
                <div className="box"
                     onMouseEnter={() => {config.extendOnHover === 'together' ? (setDateFormat(config.extendedTimeFormat), setShowSettings(true)) : null}}
                     onMouseLeave={() => {config.extendOnHover === 'together' ? (setDateFormat(config.defaultTimeFormat), setShowSettings(false)) : null}}
                >
                    {showSpotifyWidget ? <SpotifyWidget showSettings={showSettings} setShowSettings={setShowSettings} isFavorite={isFavorite} setIsFavorite={setIsFavorite}/> : null}
                    {showSpotifyWidget ? <button className="separator-button" disabled style={bigIcons}>{config.spotifySeperator}</button> : null}
                    <button className="clean-button">
                        <a href="ms-actioncenter:" style={hrefStyle}
                           onMouseEnter={() => {(config.extendOnHover === 'both' || config.extendOnHover === 'clock') ? setDateFormat(config.extendedTimeFormat) : null}}
                           onMouseLeave={() => {(config.extendOnHover === 'both' || config.extendOnHover === 'clock') ? setDateFormat(config.defaultTimeFormat) : null}}
                        >
                            <i className="nf nf-md-calendar_month" style={bigIcons}></i>
                            {moment(output.date?.now).format(dateFormat)}
                        </a>
                    </button>
                </div>
            </div>

            <div className="right">
                {showGoogleSearch && output.glazewm ? <GoogleSearch
                    commandRunner={output.glazewm.runCommand} browserPath={config.browserPath}/> : null}
                <div className="box">
                    {output.glazewm && (
                        <>
                            {output.glazewm.bindingModes.map(bindingMode => (
                                <button
                                    className="binding-mode"
                                    key={bindingMode.name}
                                >
                                    {bindingMode.displayName ?? bindingMode.name}
                                </button>
                            ))}

                            <button className={`tiling-direction nf ${output.glazewm.tilingDirection === 'horizontal' ? 'nf-md-swap_horizontal' : 'nf-md-swap_vertical'}`} 
                                    onClick={() => output.glazewm.runCommand('toggle-tiling-direction')}>
                            </button>
                        </>
                    )}
                    {<Settings widgetObj={[
                        {name: 'Spotify', changeState: setShowSpotifyWidget},
                        {name: 'Google Search', changeState: setShowGoogleSearch},
                        {name: 'Shortcuts', changeState: setShowShortcuts}
                    ]}/>}

                    {output.network && (
                        <div className="network">
                            {getNetworkIcon(output.network)}
                            {output.network.defaultGateway?.ssid}
                        </div>
                    )}

                    {output.memory && (
                        <button className="memory clean-button" onClick={
                            () => output.glazewm.runCommand('shell-exec taskmgr')
                        }>
                            <i className="nf nf-fae-chip"></i>
                            {Math.round(output.memory.usage)}%
                        </button>
                    )}

                    {output.cpu && (
                        <button className="cpu clean-button" onClick={
                            () => output.glazewm.runCommand('shell-exec taskmgr')
                        }>
                            <i className="nf nf-oct-cpu"></i>

                            {/* Change the text color if the CPU usage is high. */}
                            <span
                                className={output.cpu.usage > 85 ? 'high-usage' : ''}
                            >
                    {Math.round(output.cpu.usage)}%
                  </span>
                        </button>
                    )}

                    {output.battery && (
                        <div className="battery">
                            {/* Show icon for whether battery is charging. */}
                            {output.battery.isCharging && (
                                <i className="nf nf-md-power_plug charging-icon"></i>
                            )}
                            {getBatteryIcon(output.battery)}
                            {Math.round(output.battery.chargePercent)}%
                        </div>
                    )}

                    {output.weather && (
                        <div className="weather">
                            {getWeatherIcon(output.weather)}
                            {Math.round(output.weather.celsiusTemp)}°C
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}