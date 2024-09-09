import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import { Header } from 'semantic-ui-react';

const TaskColumn = ({ droppableId, tasks, title, columnColor, updateTaskStatus, handleDeleteTask }) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided) => (
        <div
          className="task-column"
          style={{ padding: '0', backgroundColor: columnColor }}
          
        >

          <Header as='h2' style={{ margin: '10px auto' , selfAlign: 'center', color: 'white' , padding: '10px'}}>
            {title}
          </Header>
          <div
            className='task-column-content'
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                {(provided) => (
                  <TaskCard
                    task={task}
                    provided={provided}
                    updateTaskStatus={updateTaskStatus}
                    handleDeleteTask={handleDeleteTask}
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
