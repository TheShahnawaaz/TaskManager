// src/Dashboard.js
import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import {
  Button,
  Grid,
  Container,
  Header,
  Loader,
  Dimmer,
  Icon,
} from 'semantic-ui-react';
import TaskColumn from './components/TaskColumn';
import CreateTaskModal from './components/CreateTaskModal';
import FilterSearchModal from './components/FilterSearchModal'; // Import the new modal
import ActivityLog from './components/ActivityLog';
import { db, auth } from './firebaseConfig'; // Import Firestore db and auth
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'; // Firestore methods
import './index.css'; // Import your custom CSS here

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // State for Filter/Search Modal
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'todo',
    priority: 'Medium',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true); // Loader state for tasks

  // Fetch tasks for the authenticated user on mount
  useEffect(() => {
    const fetchTasksFromFirestore = async () => {
      try {
        const q = query(
          collection(db, 'tasks'),
          where('userId', '==', auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const firestoreTasks = [];
        querySnapshot.forEach((doc) => {
          firestoreTasks.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          });
        });
        // Sort tasks by createdAt
        firestoreTasks.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
        setTasks(firestoreTasks);
        setLoadingTasks(false);
      } catch (error) {
        console.error('Error fetching tasks from Firestore:', error);
        setLoadingTasks(false);
      }
    };
    fetchTasksFromFirestore();
  }, []);

  // Persist Dark Mode preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('isDarkMode');
    if (savedTheme) {
      setIsDarkMode(JSON.parse(savedTheme));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Handle adding activity logs
  const logActivity = async (message) => {
    try {
      await addDoc(collection(db, 'activityLogs'), {
        userId: auth.currentUser.uid,
        message,
        timestamp: serverTimestamp(),
      });
      // ActivityLog component fetches logs directly from Firestore
    } catch (error) {
      console.error('Error adding activity log:', error);
    }
  };

  // Handle creating a new task
  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.dueDate) {
      alert('Title and Due Date are required.');
      return;
    }

    const taskData = {
      ...newTask,
      userId: auth.currentUser.uid,
      subtasks: [],
      notified: false,
      overdueNotified: false,
      createdAt: serverTimestamp(), // Add createdAt
      updatedAt: serverTimestamp(),
    };

    // Add to Firestore
    try {
      const docRef = await addDoc(collection(db, 'tasks'), taskData);
      const newTaskWithId = {
        id: docRef.id,
        ...taskData,
        createdAt: new Date(), // Approximate for client-side display
        updatedAt: new Date(),
      };
      setTasks((prevTasks) => [...prevTasks, newTaskWithId]);
      logActivity(`Created task "${newTaskWithId.title}"`);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        status: 'todo',
        priority: 'Medium',
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error adding task: ', error);
    }
  };

  // Update Firestore and log activity
  const updateFirestoreAndLog = async (updatedTasks, message) => {
    try {
      const batch = writeBatch(db);
      updatedTasks.forEach((task) => {
        const taskRef = doc(db, 'tasks', task.id);
        batch.set(
          taskRef,
          {
            ...task,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      });
      await batch.commit();
      logActivity(message);
    } catch (error) {
      console.error('Error updating Firestore:', error);
    }
  };

  // Update task status
  const updateTaskStatus = async (id, newStatus) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const previousStatus = task.status;

    const updatedTask = { ...task, status: newStatus, updatedAt: new Date() };
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === id ? updatedTask : t))
    );

    await updateFirestoreAndLog(
      [updatedTask],
      `Changed status of task "${task.title}" from "${capitalize(
        previousStatus
      )}" to "${capitalize(newStatus)}"`
    );
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    try {
      await deleteDoc(doc(db, 'tasks', id));
      logActivity(`Deleted task "${task.title}"`);
    } catch (error) {
      console.error('Error deleting task from Firestore:', error);
    }
  };

  // Add subtask
  const handleAddSubtask = async (taskId, subtaskTitle) => {
    if (!subtaskTitle.trim()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newSubtask = {
      id: task.subtasks.length + 1,
      title: subtaskTitle,
      completed: false,
      createdAt: new Date(), // Client-side timestamp
      updatedAt: new Date(),
    };

    console.log(newSubtask);

    const updatedTask = {
      ...task,
      subtasks: [...task.subtasks, newSubtask],
      updatedAt: new Date(),
    };

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? updatedTask : t))
    );

    try {
      await setDoc(
        doc(db, 'tasks', taskId),
        {
          subtasks: updatedTask.subtasks,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      logActivity(
        `Added subtask "${newSubtask.title}" to task "${task.title}"`
      );
    } catch (error) {
      console.error('Error adding subtask to Firestore:', error);
    }
  };

  // Toggle subtask completion
  const handleToggleSubtask = async (taskId, subtaskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const subtask = task.subtasks.find((s) => s.id === subtaskId);
    if (!subtask) return;

    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId
        ? {
            ...s,
            completed: !s.completed,
            updatedAt: new Date(),
            completedAt: !s.completed ? new Date() : null,
          }
        : s
    );

    const updatedTask = {
      ...task,
      subtasks: updatedSubtasks,
      updatedAt: new Date(),
    };

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? updatedTask : t))
    );

    try {
      await setDoc(
        doc(db, 'tasks', taskId),
        {
          subtasks: updatedTask.subtasks,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      logActivity(
        `${
          !subtask.completed ? 'Completed' : 'Marked as incomplete'
        } subtask "${subtask.title}" in task "${task.title}"`
      );
    } catch (error) {
      console.error('Error toggling subtask in Firestore:', error);
    }
  };

  // Search and filter logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus ? task.status === filterStatus : true;
    const matchesPriority = filterPriority
      ? task.priority === filterPriority
      : true;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Helper function to capitalize strings
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Request Notification Permission on Mount
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Check Due Dates and Trigger Notifications
  useEffect(() => {
    const checkDueDates = () => {
      const now = new Date();
      tasks.forEach((task) => {
        const dueDate = new Date(task.dueDate);
        const timeDiff = dueDate - now;
        const oneDay = 24 * 60 * 60 * 1000;

        // Notify if due within 24 hours
        if (timeDiff > 0 && timeDiff < oneDay && !task.notified) {
          new Notification('Task Due Soon', {
            body: `${task.title} is due on ${dueDate.toLocaleDateString()}`,
          });
          // Update task to mark as notified
          updateTaskNotified(task.id, true);
          logActivity(`Notified about task "${task.title}" due soon`);
        }

        // Notify if overdue
        if (timeDiff < 0 && !task.overdueNotified) {
          new Notification('Task Overdue', {
            body: `${task.title} was due on ${dueDate.toLocaleDateString()}`,
          });
          // Update task to mark as overdue notified
          updateTaskOverdueNotified(task.id, true);
          logActivity(`Notified about overdue task "${task.title}"`);
        }
      });
    };

    const updateTaskNotified = async (taskId, notifiedStatus) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        notified: notifiedStatus,
        updatedAt: new Date(),
      };
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? updatedTask : t))
      );

      try {
        await setDoc(
          doc(db, 'tasks', taskId),
          {
            notified: notifiedStatus,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Error updating notified status in Firestore:', error);
      }
    };

    const updateTaskOverdueNotified = async (
      taskId,
      overdueNotifiedStatus
    ) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const updatedTask = {
        ...task,
        overdueNotified: overdueNotifiedStatus,
        updatedAt: new Date(),
      };
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? updatedTask : t))
      );

      try {
        await setDoc(
          doc(db, 'tasks', taskId),
          {
            overdueNotified: overdueNotifiedStatus,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error(
          'Error updating overdueNotified status in Firestore:',
          error
        );
      }
    };

    checkDueDates();
    const interval = setInterval(checkDueDates, 60 * 60 * 1000); // Check every hour
    return () => clearInterval(interval);
  }, [tasks]);

  // Handle drag and drop
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
      const columnTasks = Array.from(
        filteredTasks.filter((task) => task.status === source.droppableId)
      );
      const [movedTask] = columnTasks.splice(source.index, 1);
      columnTasks.splice(destination.index, 0, movedTask);

      // Update tasks state with reordered tasks
      setTasks((prevTasks) => {
        const otherTasks = prevTasks.filter(
          (task) => task.status !== source.droppableId
        );
        return [...otherTasks, ...columnTasks];
      });

      updateFirestoreAndLog(
        columnTasks,
        `Reordered tasks in "${capitalize(source.droppableId)}" column`
      );
    } else {
      const movedTask = tasks.find((task) => task.id === draggableId);
      if (!movedTask) return;
      const previousStatus = movedTask.status;
      const newStatus = destination.droppableId;

      const updatedTask = { ...movedTask, status: newStatus, updatedAt: new Date() };
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === movedTask.id ? updatedTask : t))
      );

      updateFirestoreAndLog(
        [updatedTask],
        `Moved task "${movedTask.title}" from "${capitalize(
          previousStatus
        )}" to "${capitalize(newStatus)}" column`
      );
    }
  };

  if (loadingTasks) {
    return (
      <Dimmer active inverted>
        <Loader size='large'>Loading Tasks...</Loader>
      </Dimmer>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container
        className={`dashboard ${isDarkMode ? 'dark-mode' : ''}`}
        style={{ marginTop: '0', padding: '0' }}
      >
        <Grid>
          {/* Header Section */}
          <Grid.Row columns={2}>
            <Grid.Column>
              {/* <Header as='h2'>Dashboard</Header> */}
              <Button
                color='blue'
                onClick={() => setIsCreateModalOpen(true)}
                icon
                labelPosition='left'
              >
                <Icon name='plus' />CreateTask</Button>
            </Grid.Column>
            <Grid.Column textAlign='right'>
              <Button
                color='teal'
                onClick={() => setIsFilterModalOpen(true)}
                icon
                labelPosition='left'
                // style={{ marginLeft: '10px' }}
              >
                <Icon name='filter' />
                Filter/Search
              </Button>
              {/* Dark Mode Toggle (Optional) */}
              {/* <Button
                color={isDarkMode ? 'yellow' : 'black'}
                onClick={() => setIsDarkMode(!isDarkMode)}
                icon
                labelPosition='left'
                style={{ marginLeft: '10px' }}
              >
                <Icon name={isDarkMode ? 'sun' : 'moon'} />
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </Button> */}
            </Grid.Column>
          </Grid.Row>

          {/* Task Columns */}
          <Grid.Row columns={3} divided stackable style={{ gap: '10px' }}>
            <TaskColumn
              droppableId='todo'
              tasks={filteredTasks.filter((task) => task.status === 'todo')}
              title='TODO'
              columnColor='#8A30E5'
              updateTaskStatus={updateTaskStatus}
              handleDeleteTask={handleDeleteTask}
              handleAddSubtask={handleAddSubtask}
              handleToggleSubtask={handleToggleSubtask}
            />
            <TaskColumn
              droppableId='in-progress'
              tasks={filteredTasks.filter(
                (task) => task.status === 'in-progress'
              )}
              title='IN PROGRESS'
              columnColor='#FFC14E'
              updateTaskStatus={updateTaskStatus}
              handleDeleteTask={handleDeleteTask}
              handleAddSubtask={handleAddSubtask}
              handleToggleSubtask={handleToggleSubtask}
            />
            <TaskColumn
              droppableId='completed'
              tasks={filteredTasks.filter(
                (task) => task.status === 'completed'
              )}
              title='COMPLETED'
              columnColor='#06C270'
              updateTaskStatus={updateTaskStatus}
              handleDeleteTask={handleDeleteTask}
              handleAddSubtask={handleAddSubtask}
              handleToggleSubtask={handleToggleSubtask}
            />
          </Grid.Row>

          {/* Activity Log Section */}
          <Grid.Row>
            <Grid.Column width={16}>
              <ActivityLog />
            </Grid.Column>
          </Grid.Row>

          {/* Create Task Modal */}
          {isCreateModalOpen && (
            <CreateTaskModal
              newTask={newTask}
              setNewTask={setNewTask}
              handleCreateTask={handleCreateTask}
              setIsModalOpen={setIsCreateModalOpen}
            />
          )}

          {/* Filter/Search Modal */}
          {isFilterModalOpen && (
            <FilterSearchModal
              open={isFilterModalOpen}
              onClose={() => setIsFilterModalOpen(false)}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterPriority={filterPriority}
              setFilterPriority={setFilterPriority}
            />
          )}
        </Grid>
      </Container>
    </DragDropContext>
  );
};

export default Dashboard;
