// src/components/TaskColumn.js
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import { Header } from 'semantic-ui-react';

const TaskColumn = ({ 
  droppableId, 
  tasks, 
  title, 
  columnColor, 
  updateTaskStatus, 
  handleDeleteTask, 
  handleAddSubtask, 
  handleToggleSubtask 
}) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided) => (
        <div
          className="task-column"
          style={{ padding: '0px', backgroundColor: columnColor, borderRadius: '15px' }}
        >
          <Header as='h2' style={{ margin: '10px auto', textAlign: 'center', color: 'white', padding: '10px' }}>
            {title}
          </Header>
          <div
            className='task-column-content'
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <TaskCard
                    task={task}
                    provided={provided}
                    updateTaskStatus={updateTaskStatus}
                    handleDeleteTask={handleDeleteTask}
                    handleAddSubtask={handleAddSubtask}
                    handleToggleSubtask={handleToggleSubtask}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default TaskColumn;
