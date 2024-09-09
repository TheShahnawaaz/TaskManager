import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Grid, Paper, Typography } from '@mui/material';
import TaskCard from './components/TaskCard';

const TaskColumn = ({ droppableId, tasks, title, columnColor, updateTaskStatus, handleDeleteTask }) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided) => (
        <Grid item xs={12} md={4}>
          <Paper
            sx={{ backgroundColor: columnColor, padding: '20px', borderRadius: '8px', minHeight: '500px' }}
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                updateTaskStatus={updateTaskStatus}
                handleDeleteTask={handleDeleteTask}
              />
            ))}
            {provided.placeholder}
          </Paper>
        </Grid>
      )}
    </Droppable>
  );
};

export default TaskColumn;
