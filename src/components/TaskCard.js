// src/components/TaskCard.js
import React, { useState } from 'react';
import { Label, Card, Dropdown, Button, Grid, Header, Divider, Icon, List, Checkbox, Input, Loader } from 'semantic-ui-react';

const TaskCard = ({ 
  task, 
  provided, 
  updateTaskStatus, 
  handleDeleteTask, 
  handleAddSubtask, 
  handleToggleSubtask 
}) => {
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false); // Loader state for subtask actions

  // Dropdown options for task status
  const statusOptions = [
    { key: 'todo', value: 'todo', text: 'Todo' },
    { key: 'in-progress', value: 'in-progress', text: 'In Progress' },
    { key: 'completed', value: 'completed', text: 'Completed' }
  ];

  // Function to return the appropriate label based on the task priority
  const getLabelComponent = (task) => {
    if (task.priority === 'High') {
      return <Label color='red' ribbon='right'>High</Label>;
    } else if (task.priority === 'Medium') {
      return <Label color='yellow' ribbon='right'>Medium</Label>;
    } else {
      return <Label color='green' ribbon='right'>Low</Label>;
    }
  };

  // Format the due date to DD/MM/YYYY
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };

  const handleAddSubtaskClick = async () => {
    if (!subtaskInput.trim()) return;
    setIsUpdating(true);
    await handleAddSubtask(task.id, subtaskInput);
    setSubtaskInput('');
    setIsUpdating(false);
  };

  const handleToggleSubtaskClick = async (subtaskId) => {
    setIsUpdating(true);
    await handleToggleSubtask(task.id, subtaskId);
    setIsUpdating(false);
  };

  return (
    <div
      className="task-card"
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
    >
      <Card fluid color='orange' style={{ marginBottom: '20px', padding: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '15px' }} raised>
        <Card.Content>
          <Grid>
            <Grid.Row>
              <Grid.Column width={12}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Title and dropdown inline */}
                  <Header as='h3' style={{ flexGrow: 1, margin: '0 10px 0 0' }}> 
                    {task.title} 
                  </Header>
                  <Dropdown style={{ zIndex : "100"}}>
                    <Dropdown.Menu>
                      <Dropdown.Header content='Change Status' />
                      {statusOptions.map(option => (
                        <Dropdown.Item
                          key={option.key}
                          active={task.status === option.value}
                          onClick={() => updateTaskStatus(task.id, option.value)}
                        >
                          {option.text}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </Grid.Column>
              <Grid.Column width={4} textAlign="right">
                {getLabelComponent(task)}
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Divider />
          {/* Task description and due date */}
          <Card.Description style={{ marginBottom: '10px', fontSize: '14px' }}>
            {task.description}
          </Card.Description>
          <Card.Meta>
            <span style={{ color: 'gray', fontSize: '13px' }}>
              <Icon name='calendar alternate outline' /> {/* Calendar Icon */}
              &nbsp;&nbsp;
              {formatDate(task.dueDate)} {/* Formatted Due Date */}
            </span>
          </Card.Meta>

          {/* Subtasks Section */}
          <div style={{ marginTop: '10px' }}>
            <Header as='h4'>Subtasks</Header>
            <List divided relaxed>
              {task.subtasks && task.subtasks.map(subtask => (
                <List.Item key={subtask.id} onClick={() => handleToggleSubtaskClick(subtask.id)}>
                  <Card.Description style={{ marginBottom: '10px', fontSize: '14px' }}>
                  {subtask.completed && <Icon name='check circle' color='green' />}
                  {!subtask.completed && <Icon name='circle outline' color='grey' />}
                  <Header as='h5' style={{ display: 'inline' }}> 
                    {subtask.title}
                  </Header>
                  </Card.Description>
                  <Card.Meta>
    
                  <span style={{ color: 'grey', fontSize: '12px' }}>
                    <Icon name='clock outline' /> 
                    &nbsp;
                    {subtask.createdAt ? 
                      (() => {
                        const date = new Date(subtask.createdAt.seconds * 1000);
                        return isNaN(date.getTime()) ? subtask.createdAt.toLocaleString() : date.toLocaleString();
                      })() 
                      : 'N/A'}
                  </span>
                  </Card.Meta>

                </List.Item>
              ))}
            </List>
            <Input
              placeholder='Add subtask...'
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              action={{
                color: 'green',
                icon: 'add',
                onClick: handleAddSubtaskClick
              }}
              disabled={isUpdating}
            />
            
          </div>
        </Card.Content>

        <Card.Content extra>
          {isUpdating && <Loader active inline size='small' />}
          {/* Delete button */}
          <Button
            circular
            color='red'
            floated='right'
            icon='trash'
            onClick={() => handleDeleteTask(task.id)}
          />
        </Card.Content>
      </Card>
    </div>
  );
};

export default TaskCard;
