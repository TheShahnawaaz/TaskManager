import React from 'react';
import { Modal, Button, Form } from 'semantic-ui-react';

const CreateTaskModal = ({ newTask, setNewTask, handleCreateTask, setIsModalOpen }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prevTask => ({
      ...prevTask,
      [name]: value,
    }));
  };

  return (
    <Modal open onClose={() => setIsModalOpen(false)} size="small">
      <Modal.Header>Create New Task</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input
            label="Title *"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            required
          />
          <Form.TextArea
            label="Description"
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
          />
          <Form.Input
            type="date"
            label="Select Date *"
            name="dueDate"
            value={newTask.dueDate}
            onChange={handleInputChange}
            required
          />
          <Form.Select
            label="Status"
            name="status"
            options={[
              { key: 'todo', value: 'todo', text: 'Todo' },
              { key: 'in-progress', value: 'in-progress', text: 'In Progress' },
              { key: 'completed', value: 'completed', text: 'Completed' }
            ]}
            value={newTask.status}
            onChange={(e, { value }) => setNewTask(prev => ({ ...prev, status: value }))}
          />
          <Form.Select
            label="Priority"
            name="priority"
            options={[
              { key: 'high', value: 'High', text: 'High' },
              { key: 'medium', value: 'Medium', text: 'Medium' },
              { key: 'low', value: 'Low', text: 'Low' }
            ]}
            value={newTask.priority}
            onChange={(e, { value }) => setNewTask(prev => ({ ...prev, priority: value }))}
          />
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleCreateTask} color="green">
          Create Task
        </Button>
        <Button onClick={() => setIsModalOpen(false)} color="red">
          Cancel
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default CreateTaskModal;
