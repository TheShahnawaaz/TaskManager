// src/components/FilterSearchModal.js
import React from 'react';
import { Modal, Button, Form, Dropdown } from 'semantic-ui-react';

const FilterSearchModal = ({
  open,
  onClose,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
}) => {
  const statusOptions = [
    { key: 'todo', value: 'todo', text: 'Todo' },
    { key: 'in-progress', value: 'in-progress', text: 'In Progress' },
    { key: 'completed', value: 'completed', text: 'Completed' },
  ];

  const priorityOptions = [
    { key: 'high', value: 'High', text: 'High' },
    { key: 'medium', value: 'Medium', text: 'Medium' },
    { key: 'low', value: 'Low', text: 'Low' },
  ];

  const handleReset = () => {
    setSearchTerm('');
    setFilterStatus('');
    setFilterPriority('');
  };

  return (
    <Modal open={open} onClose={onClose} size='small'>
      <Modal.Header>Search and Filter Tasks</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Field>
            <label>Search</label>
            <Form.Input
              icon='search'
              placeholder='Search tasks...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Form.Field>
          <Form.Field>
            <label>Filter by Status</label>
            <Dropdown
              placeholder='Select Status'
              selection
              clearable
              options={statusOptions}
              value={filterStatus}
              onChange={(e, { value }) => setFilterStatus(value)}
            />
          </Form.Field>
          <Form.Field>
            <label>Filter by Priority</label>
            <Dropdown
              placeholder='Select Priority'
              selection
              clearable
              options={priorityOptions}
              value={filterPriority}
              onChange={(e, { value }) => setFilterPriority(value)}
            />
          </Form.Field>
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleReset} color='grey'>
          Reset
        </Button>
        <Button onClick={onClose} positive>
          Apply
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default FilterSearchModal;
