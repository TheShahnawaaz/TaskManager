import React, { useState } from 'react';
import { Label, Card, Dropdown, Button, Grid, Header, Divider,Icon  } from 'semantic-ui-react';

const TaskCard = ({ task, provided, updateTaskStatus, handleDeleteTask }) => {
  const [activeItem, setActiveItem] = useState(null); // For menu item state

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
              &nbsp;
              &nbsp;
              {formatDate(task.dueDate)} {/* Formatted Due Date */}
            </span>

          </Card.Meta>
        </Card.Content>

        <Card.Content extra>
          {/* Delete button */}
          {/* <Button  icon='settings' /> */}
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
