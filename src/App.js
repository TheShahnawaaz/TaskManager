import React, { useState, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import { Button, Grid, Container } from 'semantic-ui-react';
import TaskColumn from './components/TaskColumn';
import CreateTaskModal from './components/CreateTaskModal';
import { db } from './firebaseConfig'; // Import Firestore db
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore'; // Firestore methods
import './index.css'; // Import your custom CSS here

const Dashboard = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks ? JSON.parse(savedTasks) : []; // Parse JSON or return empty array
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'todo',
    priority: 'medium',
  });

  // Sync Firestore with localStorage on mount
  useEffect(() => {
    const fetchTasksFromFirestore = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'tasks'));
        const firestoreTasks = [];
        querySnapshot.forEach((doc) => {
          firestoreTasks.push({ id: doc.id, ...doc.data() });
        });
        setTasks(firestoreTasks);
        localStorage.setItem('tasks', JSON.stringify(firestoreTasks));
      } catch (error) {
        console.error('Error fetching tasks from Firestore:', error);
      }
    };
    fetchTasksFromFirestore();
  }, []);
  const updateFirestoreAndLocalStorage = async () => {
  try {
    console.log('Updating Firestore and localStorage...');
    console.log('Tasks:', tasks);
    tasks.forEach(async (task) => {
      await setDoc(doc(db, 'tasks', String(task.id)), task); // Update Firestore doc
    });
    localStorage.setItem('tasks', JSON.stringify(tasks)); // Update localStorage
  } catch (error) {
    console.error('Error updating Firestore:', error);
  }
};

  // Update Firestore and localStorage when tasks change
  useEffect(() => {
    const updateFirestoreAndLocalStorage = async () => {
      try {
        console.log('Updating Firestore and localStorage...');
        console.log('Tasks:', tasks);
        tasks.forEach(async (task) => {
          await setDoc(doc(db, 'tasks', String(task.id)), task); // Update Firestore doc
        });
        localStorage.setItem('tasks', JSON.stringify(tasks)); // Update localStorage
      } catch (error) {
        console.error('Error updating Firestore:', error);
      }
    };

    updateFirestoreAndLocalStorage(); // Ensure async operation
    console.log(process.env.REACT_APP_FIREBASE_API_KEY);

  }, [tasks]);

  const handleCreateTask = () => {
    const taskId = tasks.length + 1;
    const newTaskData = { id: taskId, ...newTask };
    setTasks((prevTasks) => [...prevTasks, newTaskData]);
    setNewTask({ title: '', description: '', dueDate: '', status: 'todo', priority: '' });
    setIsModalOpen(false);
  };

  const updateTaskStatus = (id, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleDeleteTask = async (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    try {
      await deleteDoc(doc(db, 'tasks', String(id))); // Delete Firestore doc
      console.log('Task deleted:', id);
    } catch (error) {
      console.error('Error deleting task from Firestore:', error);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
  

    
    if (source.droppableId !== destination.droppableId) {
      updateTaskStatus(parseInt(result.draggableId), destination.droppableId);
      return;
    }

    const reorderedTasks = Array.from(tasks);
    const [removed] = reorderedTasks.splice(source.index, 1);
    removed.status = destination.droppableId;
    reorderedTasks.splice(destination.index, 0, removed);

    setTasks(reorderedTasks);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container className="dashboard" style={{ marginTop: '0' }}>
        <Grid>
          <Grid.Row columns={2} verticalAlign="middle">
            <Grid.Column>
              <h1>Task Manager </h1>
            </Grid.Column>
            <Grid.Column textAlign="right">
              <Button color="blue" onClick={() => setIsModalOpen(true)}>
                Create Task
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Grid columns={3} divided stackable style={{ gap: '10px' }}>
          <TaskColumn
            droppableId="todo"
            tasks={tasks.filter((task) => task.status === 'todo')}
            title="TODO"
            columnColor="#8A30E5"
            updateTaskStatus={updateTaskStatus}
            handleDeleteTask={handleDeleteTask}
          />
          <TaskColumn
            droppableId="in-progress"
            tasks={tasks.filter((task) => task.status === 'in-progress')}
            title="IN PROGRESS"
            columnColor="#FFC14E"
            updateTaskStatus={updateTaskStatus}
            handleDeleteTask={handleDeleteTask}
          />
          <TaskColumn
            droppableId="completed"
            tasks={tasks.filter((task) => task.status === 'completed')}
            title="COMPLETED"
            columnColor="#06C270"
            updateTaskStatus={updateTaskStatus}
            handleDeleteTask={handleDeleteTask}
          />
        </Grid>

        {isModalOpen && (
          <CreateTaskModal
            newTask={newTask}
            setNewTask={setNewTask}
            handleCreateTask={handleCreateTask}
            setIsModalOpen={setIsModalOpen}
          />
        )}
      </Container>
    </DragDropContext>
  );
};

export default Dashboard;
