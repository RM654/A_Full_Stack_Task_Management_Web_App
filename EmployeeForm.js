import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Style.css'; // adjust path based on your structure


const EmployeeForm = ({ token }) => {
  const [form, setForm] = useState({
    name: '',
    task: '',
    deadline: '',
    status: ''
  });

  const [employeeId, setEmployeeId] = useState('');
  const [message, setMessage] = useState('');
  const [tasksForDate, setTasksForDate] = useState([]);
  const [completeId, setCompleteId] = useState('');
  const [updateId, setUpdateId] = useState('');
const [newTask, setNewTask] = useState('');
const [newDeadline, setNewDeadline] = useState('');
const [allEmployees, setAllEmployees] = useState([]);



  // Fetch the next employee ID
  useEffect(() => {
    const fetchNextId = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/employees', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const last = res.data?.slice(-1)[0];
        const next = last && last.employeeId
          ? String(parseInt(last.employeeId) + 1).padStart(3, '0')
          : '001';
        setEmployeeId(next);
      } catch {
        setEmployeeId('001');
      }
    };
    fetchNextId();
  }, [token]);

  // Fetch tasks by selected date
  useEffect(() => {
    if (!form.deadline) return;

    const fetchTasksForDate = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/employees/by-deadline`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { deadline: form.deadline }
        });
        setTasksForDate(res.data);
      } catch (err) {
        console.error('Error fetching tasks by date:', err);
        setTasksForDate([]);
      }
    };

    fetchTasksForDate();
  }, [form.deadline, token]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'task' && value ? { status: 'incomplete' } : {})
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await axios.post(
        'http://localhost:5000/api/employees',
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessage(`Employee "${res.data.name}" added successfully with ID ${res.data.employeeId}.`);
      setForm({ name: '', task: '', deadline: '', status: '' });
      setEmployeeId(String(parseInt(res.data.employeeId) + 1).padStart(3, '0'));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to add employee');
    }
  };



const handleComplete = async () => {
  if (!completeId) {
    setMessage('Please enter an employee ID');
    return;
  }

  try {
    const res = await axios.patch(
      `http://localhost:5000/api/employees/complete/${completeId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setMessage(res.data.message);
  } catch (err) {
    setMessage(err.response?.data?.error || 'Failed to update status');
  }
};

const handleDelete = async () => {
  if (!completeId) {
    setMessage('Please enter an employee ID');
    return;
  }

  try {
    const res = await axios.get(`http://localhost:5000/api/employees/by-id/${completeId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const employee = res.data;
    if (!employee || employee.status !== 'complete') {
      setMessage('Cannot delete: Employee not found or status is not complete');
      return;
    }

    await axios.patch(
      `http://localhost:5000/api/employees/clear-fields/${completeId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setMessage('Task, deadline, and status deleted successfully');
  } catch (err) {
    setMessage(err.response?.data?.error || 'Failed to delete fields');
  }
};



const handleAddTask = async () => {
  if (!updateId || !newTask || !newDeadline) {
    setMessage('Please fill all fields to add a new task');
    return;
  }

  try {
    const res = await axios.patch(
      `http://localhost:5000/api/employees/add-task/${updateId}`,
      {
        task: newTask,
        deadline: newDeadline,
        status: 'incomplete'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    setMessage(`Task added to employee ${updateId}`);
    setNewTask('');
    setNewDeadline('');
    setUpdateId('');
  } catch (err) {
    setMessage(err.response?.data?.error || 'Failed to add task');
  }
};
const handleGetAllEmployees = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/employees/all', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setAllEmployees(res.data);
  } catch (err) {
    setMessage(err.response?.data?.error || 'Failed to fetch employee details');
  }
};



  return (
    <div>
      {message && (
  <div
    style={{
      padding: '10px',
      borderRadius: '5px',
      backgroundColor: message.includes('successfully') ? '#d4edda' : '#f8d7da',
      color: message.includes('successfully') ? '#155724' : '#721c24',
      marginBottom: '1rem',
      border: `1px solid ${message.includes('successfully') ? '#c3e6cb' : '#f5c6cb'}`,
    }}
  >
    {message}
  </div>
)}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="employeeId"
          value={employeeId}
          readOnly
          disabled
          placeholder="Employee ID"
        /><br />
        <input
          type="text"
          name="name"
          placeholder="Employee Name"
          value={form.name}
          onChange={handleChange}
          required
        /><br />
        <input
          type="text"
          name="task"
          placeholder="Task"
          value={form.task}
          onChange={handleChange}
          required
        /><br />
        <input
          type="date"
          name="deadline"
          placeholder="Deadline"
          value={form.deadline}
          onChange={handleChange}
          required
        /><br />
        <input
          type="text"
          name="status"
          placeholder="Status"
          value={form.status}
          readOnly
          disabled
        /><br />
        <button type="submit">Add Employee</button>

      </form>

      <div style={{ marginTop: '2rem' }}>
  <h3>Mark Task Complete</h3>
  <input
    type="text"
    placeholder="Enter Employee ID"
    value={completeId}
    onChange={e => setCompleteId(e.target.value)}
  />
  <button type="button" onClick={handleComplete}>Mark Complete</button>
</div>
<button type="button" onClick={handleDelete}>Delete Task Info</button>


      {form.deadline && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Tasks on {form.deadline}</h3>
          {tasksForDate.length === 0 ? (
            <p>No tasks found for this date.</p>
          ) : (
            <ul>
              {tasksForDate.map(task => (
                <li key={task._id}>
                  {task.name} - {task.task} - {new Date(task.deadline).toLocaleDateString()} - {task.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

<div style={{ marginTop: '2rem' }}>
  <h3>Add a New Task to Existing Employee</h3>
  <input
    type="text"
    placeholder="Enter Employee ID"
    value={updateId}
    onChange={e => setUpdateId(e.target.value)}
  /><br />
  <input
    type="text"
    placeholder="New Task"
    value={newTask}
    onChange={e => setNewTask(e.target.value)}
  /><br />
  <input
    type="date"
    placeholder="New Deadline"
    value={newDeadline}
    onChange={e => setNewDeadline(e.target.value)}
  /><br />
  <button type="button" onClick={handleAddTask}>Add a New Task</button>
</div>


<div style={{ marginTop: '2rem' }}>
  <h3>All Employees</h3>
  <button type="button" onClick={handleGetAllEmployees}>Employees' details</button>
  {allEmployees.length > 0 && (
    <ul>
      {allEmployees.map(emp => (
        <li key={emp._id}>
          ID: {emp.employeeId} | Name: {emp.name} | Task: {emp.task || '—'} | Deadline: {emp.deadline ? new Date(emp.deadline).toLocaleDateString() : '—'} | Status: {emp.status || '—'}
        </li>
      ))}
    </ul>
  )}
</div>



    </div>
  );
};

export default EmployeeForm;


