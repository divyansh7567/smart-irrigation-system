import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RAG() {
    const [flashMessage, setFlashMessage] = useState({
        text: "",
        success: false,
        failure: false,
    });

    const [moistureLevel, setMoistureLevel] = useState(0);
    const [motorStatus, setMotorStatus] = useState(false);
    const [continuousMonitoring, setContinuousMonitoring] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [showGraph, setShowGraph] = useState(false);
    const [moistureData, setMoistureData] = useState([]);

    const handleFlashMessage = (text, success, time) => {
        setFlashMessage({ text, success, failure: !success });
        setTimeout(() => setFlashMessage({ text: "", success: false, failure: false }), time);
    };

    // Function to fetch moisture level from an endpoint
    const fetchMoistureLevel = async () => {
        setShowTable(false);
        setShowGraph(false);
        try {
            const response = await fetch('/moisture-level', {
                method: 'POST'
            });

            if (response.status === 200) {
                const responseData = await response.json(); // Parse JSON response
                // console.log(responseData);
                setMoistureLevel(responseData.moisture_value);
                handleFlashMessage('Moisture level fetched successfully!', true, 3000)
            } else {
                // Handle non-200 status codes
                handleFlashMessage('Failed to fetch moisture level!', false, 3000)
            }
        } catch (error) {
            console.error('Error fetching moisture level:', error);
            handleFlashMessage('Error fetching moisture level!', false, 3000)
        }
    };

    // Function to toggle motor status and update backend
    const toggleMotorStatus = async () => {
        setShowTable(false);
        setShowGraph(false);
        try {
            // Toggle the local state first
            const updatedMotorStatus = !motorStatus;
            setMotorStatus(updatedMotorStatus);

            // Then send a fetch request to update the backend
            const response = await fetch('/update-motor-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ motorStatus: updatedMotorStatus }), // Send the updated motor status
            });

            if (response.status === 200) {
                // const responseData = await response.json(); // Parse JSON response
                // console.log(responseData);
                setMotorStatus(updatedMotorStatus);
                handleFlashMessage('Motor status updated successfully!', true, 3000);
            } else {
                // Handle non-200 status codes
                handleFlashMessage('Failed to update motor status!', false, 3000);
            }
        } catch (error) {
            console.error('Error updating motor status on the backend:', error);
            // Rollback UI state to the previous state if the update fails
            setMotorStatus(motorStatus);
            handleFlashMessage('Failed to update motor status!', false, 3000);
        }
    };

    // Function to toggle continuous monitoring and update backend
    const toggleContinuousMonitoring = async () => {
        setShowTable(false);
        setShowGraph(false);
        try {
            // Toggle the local state first
            const updatedContinuousMonitoringStatus = !continuousMonitoring;
            setContinuousMonitoring(updatedContinuousMonitoringStatus);

            // Then send a fetch request to update the backend
            const response = await fetch('/update-continuous-monitoring', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ continuousMonitoring: updatedContinuousMonitoringStatus }),
            });

            if (response.status === 200) {
                const responseData = await response.json(); // Parse JSON response
                // console.log(responseData);
                setContinuousMonitoring(updatedContinuousMonitoringStatus);
                handleFlashMessage(responseData.newMonitoringStatus, true, 3000);
            } else {
                // Handle non-200 status codes
                handleFlashMessage('Failed to update continuous monitoring!', false, 3000);
            }
        } catch (error) {
            setContinuousMonitoring(continuousMonitoring);
            console.error('Error updating continuous monitoring on the backend:', error);
            handleFlashMessage('Failed to update continuous monitoring!', false, 3000);
        }
    };

    const giveVoiceCommand = async () => {
        setShowTable(false);
        setShowGraph(false);
        try {
            const response = await fetch('/give-voice-command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 200) {
                const responseData = await response.json(); // Parse JSON response

                if (responseData.mode === "1") {
                    setMoistureLevel(responseData.moisture_value);
                    handleFlashMessage("Soil moisture fetched successfully!", true, 3000);
                } else if (responseData.mode === "2") {
                    // console.log(responseData);
                    setMotorStatus(true);
                    handleFlashMessage("Motor switched ON!", true, 3000);
                } else if (responseData.mode === "3") {
                    // console.log(responseData);
                    setMotorStatus(false);
                    handleFlashMessage("Motor switched OFF!", true, 3000);
                }
            }
        } catch (error) {
            console.error("Error");
            handleFlashMessage("Error", false, 3000);
        }
    }

    const fetchPastMoistureDetails = async () => {
        setShowTable(true);
        setShowGraph(false);
        try {
            const response = await fetch('/get-past-moisture-details', {
                method: 'POST'
            });

            if (response.status === 200) {
                const responseData = await response.json(); // Parse JSON response
                // console.log(responseData.moistureDetailsCursor);
                setMoistureData(responseData.moistureDetailsCursor);
                handleFlashMessage('Moisture details fetched successfully!', true, 3000)
            } else {
                // Handle non-200 status codes
                handleFlashMessage('Failed to fetch moisture details!', false, 3000)
            }
        } catch (error) {
            console.error('Error fetching moisture details:', error);
            handleFlashMessage('Error fetching moisture details!', false, 3000)
        }
    }

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp * 1000); // Convert timestamp to milliseconds
        return date.toLocaleString(); // Format the date and time in a human-readable format
    };

    const fetchAnalysis = async () => {
        setShowTable(false);
        setShowGraph(true);

        try {
            const response = await fetch('/get-past-moisture-details', {
                method: 'POST'
            });

            if (response.status === 200) {
                const responseData = await response.json(); // Parse JSON response
                // console.log(responseData.moistureDetailsCursor);
                setMoistureData(responseData.moistureDetailsCursor);
                handleFlashMessage('Moisture details fetched successfully!', true, 3000)
            } else {
                // Handle non-200 status codes
                handleFlashMessage('Failed to fetch moisture details!', false, 3000)
            }
        } catch (error) {
            console.error('Error fetching moisture details:', error);
            handleFlashMessage('Error fetching moisture details!', false, 3000)
        }
    }

    // CSS class for buttons with small gaps
    const buttonClass = "group relative flex items-center justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500";

    const buttonMargin = { margin: '5px' }; // Adjust margin as needed

    const h1Style = {
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: '5px'
    };

    const gridContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)', // Adjust number of columns as needed
        gap: '1px', // Adjust gap between buttons
    };

    return (
        <div>
            {flashMessage.success && (
                <div id="successFlashMsg" style={{ marginTop: '15px' }}>
                    {flashMessage.text}
                </div>
            )}

            {flashMessage.failure && (
                <div id="failFlashMsg" style={{ marginTop: '15px' }}>
                    {flashMessage.text}
                </div>
            )}

            <div>
                <h1 style={h1Style}>Moisture level: {moistureLevel}</h1>
            </div>

            <div>
                <h1 style={h1Style}>Motor Status: {motorStatus ? "On" : "Off"}</h1>
            </div>

            <div>
                <h1 style={h1Style}>Continuous Monitoring: {continuousMonitoring ? "Enabled" : "Disabled"}</h1>
            </div>

            <br />

            {showTable && (
                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                            <tr>
                                <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>S No</th>
                                <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Time</th>
                                <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Moisture Level</th>
                            </tr>
                        </thead>

                        {/* Table body with models data */}
                        <tbody>
                            {moistureData.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                </tr>
                            ) : (
                                moistureData.reverse().map((record, index) => (
                                    <tr key={index}>
                                        <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{index + 1}</td>
                                        <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{formatTimestamp(record.timestamp)}</td>
                                        <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{record.moisture_value}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showGraph && (
                <LineChart width={350} height={180} data={moistureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tick={false} />
                    <YAxis domain={[800, 1000]} />
                    <Tooltip formatter={(value, name, props) => [`${new Date(props.payload.timestamp * 1000).toLocaleString()}`, `${value}`]} />
                    <Legend />
                    <Line type="monotone" dataKey="moisture_value" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
            )}

            <br />

            <div style={gridContainerStyle}>
                <button className={buttonClass} style={buttonMargin} onClick={fetchMoistureLevel}>Fetch Moisture Level</button>
                <button className={buttonClass} style={buttonMargin} onClick={toggleMotorStatus}>Toggle Motor Control</button>
                <button className={buttonClass} style={buttonMargin} onClick={toggleContinuousMonitoring}>Toggle Continuous Monitoring</button>
                <button className={buttonClass} style={buttonMargin} onClick={giveVoiceCommand}>Voice Command</button>
                <button className={buttonClass} style={buttonMargin} onClick={fetchPastMoistureDetails}>Fetch past moisture details</button>
                <button className={buttonClass} style={buttonMargin} onClick={fetchAnalysis}>Fetch analysis</button>
            </div>

        </div>
    );
}
