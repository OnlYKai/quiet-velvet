import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import * as zebar from 'zebar';
import SpotifyWidget from "./components/SpotifyWidget.jsx";
import GoogleSearch from "./components/GoogleSearch.jsx";
import Shortcut from "./components/Shortcut";
import config from "./config.js";
import moment from "moment";

const providers = zebar.createProviderGroup({
    glazewm: { type: 'glazewm' },
    host: { type: 'host' },
    date: { type: 'date', formatting: 'EEE d MMM t' },
    network: { type: 'network', refreshInterval: 1000 },
    cpu: { type: 'cpu', refreshInterval: 3000 },
    memory: { type: 'memory', refreshInterval: 3000 },
    weather: { type: 'weather', refreshInterval: 900000 },
    battery: { type: 'battery', refreshInterval: 10000 },
});

createRoot(document.getElementById('root')).render(<App/>);

function App() {
    const [output, setOutput] = useState(providers.outputMap);
    const [showSpotifyControls, setShowSpotifyControls] = useState(config.spotifyControls === 'always');
    const [showLikeButton, setShowLikeButton] = useState(config.likeButton === 'always');
    
    
    
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
    
    
    /*
    // Round REM font-sizes to full pixels for alignment to work properly
    useEffect(() => {
        const setRoundedFontSize = () => {
            const smallIcons = document.querySelectorAll('.icon-small');
            const largeIcons = document.querySelectorAll('.icon-large');
            const networkValues = document.querySelectorAll('.network-values');
            
            smallIcons.forEach(icon => {
                const smallFontSize = parseFloat(getComputedStyle(icon).fontSize);
                icon.style.fontSize = `${Math.round(smallFontSize)}px`;
            });
            
            largeIcons.forEach(icon => {
                const largeFontSize = parseFloat(getComputedStyle(icon).fontSize);
                icon.style.fontSize = `${Math.round(largeFontSize)}px`;
            });
            
            networkValues.forEach(value => {
                const networkFontSize = parseFloat(getComputedStyle(value).fontSize);
                value.style.fontSize = `${Math.round(networkFontSize)}px`;
            });
        };
        setRoundedFontSize();
    }, []);
    */
    
    
    function getNetworkIcon(networkOutput) {
        switch (networkOutput.defaultInterface?.type) {
            case 'ethernet':
                return "nf-md-ethernet_cable";
            case 'wifi':
                if (networkOutput.defaultGateway?.signalStrength >= 80)
                    return "nf-md-wifi_strength_4";
                if (networkOutput.defaultGateway?.signalStrength >= 65)
                    return "nf-md-wifi_strength_3";
                if (networkOutput.defaultGateway?.signalStrength >= 40)
                    return "nf-md-wifi_strength_2";
                if (networkOutput.defaultGateway?.signalStrength >= 25)
                    return "nf-md-wifi_strength_1";
                return "nf-md-wifi_strength_outline";
            default:
                return "nf-md-wifi_strength_off_outline";
        }
    }
    
    function getBatteryIcon(batteryOutput) {
        if (batteryOutput.isCharging) {
            if (batteryOutput.chargePercent > 99)
                return "nf-md-battery_charging_100";
            if (batteryOutput.chargePercent > 89)
                return "nf-md-battery_charging_90";
            if (batteryOutput.chargePercent > 79)
                return "nf-md-battery_charging_80";
            if (batteryOutput.chargePercent > 69)
                return "nf-md-battery_charging_70";
            if (batteryOutput.chargePercent > 59)
                return "nf-md-battery_charging_60";
            if (batteryOutput.chargePercent > 49)
                return "nf-md-battery_charging_50";
            if (batteryOutput.chargePercent > 39)
                return "nf-md-battery_charging_40";
            if (batteryOutput.chargePercent > 29)
                return "nf-md-battery_charging_30";
            if (batteryOutput.chargePercent > 19)
                return "nf-md-battery_charging_20";
            if (batteryOutput.chargePercent > 9)
                return "nf-md-battery_charging_10";
            return "nf-md-battery_charging_outline";
        }
        if (batteryOutput.chargePercent > 99)
            return "nf-md-battery";
        if (batteryOutput.chargePercent > 89)
            return "nf-md-battery_90";
        if (batteryOutput.chargePercent > 79)
            return "nf-md-battery_80";
        if (batteryOutput.chargePercent > 69)
            return "nf-md-battery_70";
        if (batteryOutput.chargePercent > 59)
            return "nf-md-battery_60";
        if (batteryOutput.chargePercent > 49)
            return "nf-md-battery_50";
        if (batteryOutput.chargePercent > 39)
            return "nf-md-battery_40";
        if (batteryOutput.chargePercent > 29)
            return "nf-md-battery_30";
        if (batteryOutput.chargePercent > 19)
            return "nf-md-battery_20";
        if (batteryOutput.chargePercent > 9)
            return "nf-md-battery_10";
        return "nf-md-battery_outline";
    }
    
    function getWeatherIcon(weatherOutput) {
        switch (weatherOutput.status) {
            case 'clear_day':
                return "nf-weather-day_sunny";
            case 'clear_night':
                return "nf-weather-night_clear";
            case 'cloudy_day':
                return "nf-weather-day_cloudy";
            case 'cloudy_night':
                return "nf-weather-night_alt_cloudy";
            case 'light_rain_day':
                return "nf-weather-day_sprinkle";
            case 'light_rain_night':
                return "nf-weather-night_alt_sprinkle";
            case 'heavy_rain_day':
                return "nf-weather-day_rain";
            case 'heavy_rain_night':
                return "nf-weather-night_alt_rain";
            case 'snow_day':
                return "nf-weather-day_snow";
            case 'snow_night':
                return "nf-weather-night_alt_snow";
            case 'thunder_day':
                return "nf-weather-day_lightning";
            case 'thunder_night':
                return "nf-weather-night_alt_lightning";
        }
    }
    
    
    
    return (
        <div className="app">
            
            <div className="left">
                <div className="box" style={{paddingLeft: '0'}}>
                    <button className="transparent-button box in-box" style={{lineHeight: '18px', marginLeft: '-2px'}} onClick={() => output.glazewm.runCommand('shell-exec explorer .')}>
                        <i className="nf nf-custom-windows" style={{fontSize: '18px', marginRight: '7px'}}></i>
                        {output.host?.hostname}
                    </button>
                    {output.glazewm && (
                        <div className="flex-container-gap">
                            {output.glazewm.currentWorkspaces.map(workspace => (
                                <button
                                    className={`workspace ${workspace.hasFocus && 'focused'} ${workspace.isDisplayed && 'displayed'}`}
                                    onClick={() => output.glazewm.runCommand(`focus --workspace ${workspace.name}`,)} key={workspace.name}
                                >
                                    {workspace.displayName ?? workspace.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {config.showShortcuts && output.glazewm ? <div className="flex-container-gap" style={{marginLeft: "5px"}}>
                    <Shortcut commandRunner={output.glazewm.runCommand}
                              commands={[
                                  'focus --workspace 1',
                                  `shell-exec ${config.terminalPath}`
                              ]}
                              icon="nf-cod-terminal_powershell" name="Terminal"
                    />
                </div> : null}
            </div>
            
            
            
            <div className="center">
                {config.showSpotifyWidget && (
                    <div className="box" style={{paddingRight: '0'}}
                         onMouseEnter={() => {if (config.spotifyControls === 'hover') {setShowSpotifyControls(true)} if (config.likeButton === 'hover') {setShowLikeButton(true)}}}
                         onMouseLeave={() => {if (config.spotifyControls === 'hover') {setShowSpotifyControls(false)} if (config.likeButton === 'hover') {setShowLikeButton(false)}}}
                    >
                        <SpotifyWidget showSpotifyControls={showSpotifyControls} showLikeButton={showLikeButton} />
                    </div>
                )}
            </div>
            
            
            
            <div className="right">
                {config.showGoogleSearch && output.glazewm ? <GoogleSearch commandRunner={output.glazewm.runCommand} browserPath={config.browserPath}/> : null}
                <div className="box" style={config.showClock ? {paddingRight: '0'} : null}>
                    {output.glazewm && (
                        <>
                            {config.showBindingMode && (
                                <>
                                    {output.glazewm.bindingModes.map(bindingMode => (
                                        <button
                                            className="binding-mode"
                                            key={bindingMode.name}
                                        >
                                            {bindingMode.displayName ?? bindingMode.name}
                                        </button>
                                    ))}
                                </>
                            )}
                            {config.tilingDirectionButton && (
                                <button
                                    className={`tiling-direction nf ${output.glazewm.tilingDirection === 'horizontal' ? 'nf-md-swap_horizontal' : 'nf-md-swap_vertical'}`}
                                    onClick={() => output.glazewm.runCommand('toggle-tiling-direction')}>
                                </button>
                            )}
                        </>
                    )}

                    {config.showNetwork && output.network && (
                        <button className="transparent-button" onClick={() => output.glazewm.runCommand('shell-exec %userprofile%/.glzr/zebar/quiet-velvet/scripts/OpenQuickSettings.ahk')}>
                            <i className={`nf ${getNetworkIcon(output.network)} icon-small`}></i>
                            <div className="network-values">
                                <span>{(Math.round(output.network.traffic.transmitted.bytes / 1000)) >= 100 ? `${(Math.round(output.network.traffic.transmitted.bytes / 100000) / 10).toFixed(1)}MB/s` : `${Math.round(output.network.traffic.transmitted.bytes / 1000).toString().padStart(2, '0')} KB/s`}</span>
                                <span>{(Math.round(output.network.traffic.received.bytes / 1000)) >= 100 ? `${(Math.round(output.network.traffic.received.bytes / 100000) / 10).toFixed(1)}MB/s` : `${Math.round(output.network.traffic.received.bytes / 1000).toString().padStart(2, '0')} KB/s`}</span>
                            </div>
                        </button>
                    )}

                    {config.showMemory && output.memory && (
                        <button className="transparent-button lh-small" onClick={() => output.glazewm.runCommand('shell-exec %userprofile%/.glzr/zebar/quiet-velvet/scripts/OpenTaskManager.ahk')}>
                            <i className="nf nf-fae-chip icon-small"></i>
                            {Math.round(output.memory.usage)}%
                        </button>
                    )}

                    {config.showCPU && output.cpu && (
                        <button className="transparent-button lh-small" onClick={() => output.glazewm.runCommand('shell-exec %userprofile%/.glzr/zebar/quiet-velvet/scripts/OpenTaskManager.ahk')}>
                            <i className="nf nf-oct-cpu icon-small"></i>
                            <span style={{color: (output.cpu.usage > 85 ? '#900029' : 'var(--font-color)')}}>{Math.round(output.cpu.usage)}%</span>
                        </button>
                    )}

                    {config.showBattery && output.battery && (
                        <div className="flex-container lh-small">
                            <i className={`nf ${getBatteryIcon(output.battery)} icon-small`}></i>
                            {Math.round(output.battery.chargePercent)}%
                        </div>
                    )}

                    {config.showWeather && output.weather && (
                        <div className="flex-container lh-small">
                            <i className={`nf ${getWeatherIcon(output.weather)} icon-small weather bold`}></i>
                            {config.useFahrenheit ? `${Math.round(output.weather.fahrenheitTemp)}°F` : `${Math.round(output.weather.celsiusTemp)}°C`}
                        </div>
                    )}

                    {config.showClock && (
                        <a className="box in-box lh-small" style={{marginRight: '-2px'}} href="ms-actioncenter:">
                            <i className="nf nf-fa-clock icon-small bold"></i>
                            {moment(output.date?.now).format(config.timeFormat)}
                        </a>
                    )}
                </div>
            </div>

        </div>
    );
}