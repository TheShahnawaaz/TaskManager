// src/components/ActivityLog.js
import React, { useEffect, useState } from 'react';
import { Table, Header, Segment, Loader, Dimmer, Icon } from 'semantic-ui-react';
import { db, auth } from '../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const ActivityLog = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      console.error('No authenticated user found.');
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'activityLogs'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const logs = [];
        querySnapshot.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() });
        });
        setActivityLogs(logs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching activity logs:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <Segment>
        <Header as='h3' dividing>
          Activity Log
        </Header>
        <Dimmer active inverted>
          <Loader>Loading Activity Logs...</Loader>
        </Dimmer>
      </Segment>
    );
  }

  return (
    <Segment>
      <Header as='h3' dividing>
        Activity Log
      </Header>
      {activityLogs.length === 0 ? (
        <p>No activities to display.</p>
      ) : (
        <Table basic='very' celled selectable >
          {/* <Table.Header>
            <Table.Row>
              <Table.HeaderCell width={4}>
                <Icon name='clock outline' /> Time
              </Table.HeaderCell>
              <Table.HeaderCell>Activity</Table.HeaderCell>
            </Table.Row>
          </Table.Header> */}

          <Table.Body>
            {activityLogs.map((log) => (
              <Table.Row key={log.id}>
                    <Table.Cell>
                        <Icon name='clock outline' /> 
                        &nbsp;
                  {log.timestamp?.toDate().toLocaleString()}
                </Table.Cell>
                <Table.Cell>
                  {log.message}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>

          <Table.Footer fullWidth>
            <Table.Row>
              <Table.HeaderCell colSpan='2'>
                <Icon name='history' /> Total Activities: {activityLogs.length}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      )}
    </Segment>
  );
};

export default ActivityLog;
