import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [tasks, setTasks] = useState();
    const [formData, setFormData] = useState({
        startDate: '',
        taskDay: '',
        interval: '',
    });

    useEffect(() => {
        populateTaskData();
    }, []);


    const contents = tasks === undefined
        ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
        : <table className="table table-striped" aria-labelledby="tabelLabel">
            <thead>
                <tr>
                    <th>Occurrence number</th>
                    <th>Todays date</th>
                    <th>First Occurrence</th>
                    <th>Previous Occurrence</th>
                    <th>Next Occurrence</th>
                </tr>
            </thead>
            <tbody>
                {tasks.map(task => {
                    const calculationRes = calculateOccurances(task.startDate, new Date().toDateString(), task.taskDay, task.interval);
                    return (
                        <tr key={task.id}>
                            <td>{calculationRes.totalCount}</td>
                            <td>{formatDate(new Date().toDateString())}</td>
                            <td>{calculationRes.firstOccurrence ? formatDate(calculationRes.firstOccurrence) : 'N/A'}</td>
                            <td>{calculationRes.firstOccurrenceBeforeToday ? formatDate(calculationRes.firstOccurrenceBeforeToday): 'N/A'}</td>
                            <td>{calculationRes.firstOccurrenceAfterToday ? formatDate(calculationRes.firstOccurrenceAfterToday): 'N/A'}</td>
                        </tr>
                    );
                }

                )}
            </tbody>
        </table>;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleNumericInputChange = (e) => {
        const { name, value } = e.target;

        // Allow only digits, excluding dots and commas
        const sanitizedValue = value.replace(/[^\d]/g, '');

        setFormData({
            ...formData,
            [name]: sanitizedValue,
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        // Validation for start date
        const selectedStartDate = new Date(formData.startDate);
        const today = new Date();

        if (selectedStartDate >= today) {
            alert("Start date must be earlier than today.");
            return;
        }

        // Validation for interval number
        if (formData.interval <= 0) {
            alert("Interval must be greater than 0.");
            return;
        }

        // Post to Database
        const requestData = {
            startDate: formData.startDate,
            taskDay: formData.taskDay,
            interval: formData.interval
        };

        try {
            const response = await fetch('tasks', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error("Failed to submit the form.");
            }

            const responseData = await response.json();

            setFormData(responseData);

        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    const handleDisplayButtonClick = () => {
        window.location.reload(false);
    };


    return (
        <div> 
            <h1 id="tabelLabel">Tasks</h1>
            <form onSubmit={handleFormSubmit}>

                <label>
                    Start Date:
                    <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleInputChange} />
                </label>

                <label>
                    Task Day:
                    <select name="taskDay" value={formData.taskDay} onChange={handleInputChange} >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                    </select>
                </label>

                <label>
                    Interval:
                    <input type="number" name="interval" value={formData.interval} onChange={handleNumericInputChange} />
                </label>

                <button type="submit">Add Task</button>
            </form>
            {contents}
            <button onClick={handleDisplayButtonClick}>Display</button>
        </div>
    );
    
    async function populateTaskData() {
        try {
            const response = await fetch('tasks');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setTasks(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    function calculateOccurances(startDate, endDate, targetDay, interval) {
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1); //time of a day bug
        const firstWeek = new Date(startDate);
        firstWeek.setDate(start.getDate() + 6);
        const targetDayIndex = daysOfWeek.indexOf(targetDay);
        let count = 0;
        let intervalCount = 0;
        let currentDate = new Date(start);
        let lastOccurrence = null;
        let firstOccurrence = null;
        let firstOccurrenceBeforeToday = null;
        let firstOccurrenceAfterToday = null;

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || targetDayIndex === -1) {
            // Invalid date or target day
            return 'Invalid input';
        }

        //check first week
        while (currentDate <= firstWeek) {
            if (currentDate.getDay() === targetDayIndex) {
                count++;
                if (!firstOccurrence) {
                    if (currentDate <= end) {
                        firstOccurrence = new Date(currentDate);
                        lastOccurrence = new Date(currentDate);
                    } else {
                        firstOccurrenceAfterToday = new Date(currentDate);
                        count = 0;
                    }

                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        //check rest with intervals
        while (currentDate <= end) {
            if (currentDate.getDay() === targetDayIndex) {
                if (intervalCount === interval-1) {
                    count++;
                    lastOccurrence = new Date(currentDate);
                    intervalCount = 0;
                }
                else {
                    intervalCount++;
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (lastOccurrence) {
            firstOccurrenceAfterToday = new Date(lastOccurrence);
            firstOccurrenceAfterToday.setDate(lastOccurrence.getDate() + 7 * interval);
            firstOccurrenceBeforeToday = new Date(lastOccurrence);
        }


        return {
            totalCount: count,
            firstOccurrence,
            firstOccurrenceBeforeToday,
            firstOccurrenceAfterToday,
        };
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
}

export default App;