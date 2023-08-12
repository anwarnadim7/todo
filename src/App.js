import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import firebaseConfig from './firebaseConfig';
import Header from './Header';
import './Todo.css';

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

function Todo() {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        const todoUnsubscribe = db
          .collection('todos')
          .where('uid', '==', user.uid)
          .onSnapshot((snapshot) => {
            const updatedTodos = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setTodos(updatedTodos);
          });
        return () => {
          todoUnsubscribe();
        };
      } else {
        setUser(null);
        setTodos([]);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  const handleSignOut = () => {
    auth.signOut();
  };

  const addTodo = () => {
    if (newTodo.trim() !== '' && user) {
      db.collection('todos').add({
        text: newTodo,
        uid: user.uid,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setNewTodo('');
    }
  };

  const deleteTodo = (id) => {
    db.collection('todos')
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists && doc.data().uid === user.uid) {
          db.collection('todos').doc(id).delete();
        }
      });
  };
  return (
    <>
      <Header user={user} handleSignIn={handleSignIn} handleSignOut={handleSignOut} />
      <div>
        {user && (
          <div className="todo-input-container">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addTodo();
                }
              }}
              className="todo-input"
              placeholder="Enter a new todo"
            />
            <button onClick={addTodo} className="todo-button">
              Add
            </button>
          </div>
        )}
      </div>
      <div className='container'>
        <div className="left-container"></div>
        <div className="right-container">
          <div className="todo-container">
            <div className="todo-content">
              {user ? (<>
                <ul className="todo-list">
                  {todos.map((todo) => (
                    <li key={todo.id} className="todo-item">
                      {todo.text}
                      <span className="todo-timestamp">
                        {todo.timestamp &&
                          new Date(todo.timestamp.seconds * 1000).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                      </span>
                      {user.uid === todo.uid && (
                        <button onClick={() => deleteTodo(todo.id)} className="todo-delete">
                          Delete
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="todo-count">Number of Todos: {todos.length}</div>
              </>
              ) : (
                <div className="not-signed-in">Please sign in to view and manage todos.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Todo;
