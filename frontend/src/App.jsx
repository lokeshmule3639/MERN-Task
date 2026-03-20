import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';
import axios from 'axios';
import { Play, Save, History, Loader2 } from 'lucide-react';

const API_BASE_URL = window.location.origin === 'http://localhost:5173' 
  ? 'http://localhost:5000/api' 
  : '/api';

// Custom Input Node
const InputNode = ({ data }) => {
  return (
    <div className="custom-node input-node">
      <div className="node-header">Input Node</div>
      <div className="node-content">
        <textarea
          rows="4"
          placeholder="Type your prompt here..."
          value={data.value}
          onChange={(evt) => data.onChange(evt.target.value)}
          className="node-textarea"
        />
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

// Custom Result Node
const ResultNode = ({ data }) => {
  return (
    <div className="custom-node result-node">
      <Handle type="target" position={Position.Left} />
      <div className="node-header">Result Node</div>
      <div className="node-content">
        <div className="result-text">
          {data.loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin h-4 w-4" />
              Thinking...
            </div>
          ) : (
            data.value || 'Response will appear here...'
          )}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  inputNode: InputNode,
  resultNode: ResultNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'inputNode',
    data: { value: '', onChange: () => {} },
    position: { x: 100, y: 100 },
  },
  {
    id: '2',
    type: 'resultNode',
    data: { value: '', loading: false },
    position: { x: 500, y: 100 },
  },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2', animated: true }];

function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onInit = (reactFlowInstance) => {
    reactFlowInstance.fitView();
  };

  const handleInputChange = useCallback((newValue) => {
    setPrompt(newValue);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          return { ...node, data: { ...node.data, value: newValue } };
        }
        return node;
      })
    );
  }, []);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '1') {
          return { ...node, data: { ...node.data, onChange: handleInputChange } };
        }
        return node;
      })
    );
  }, [handleInputChange]);

  const runFlow = async () => {
    if (!prompt) return;
    setLoading(true);
    setResponse('');
    
    // Update result node to loading state
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === '2') {
          return { ...node, data: { ...node.data, loading: true, value: '' } };
        }
        return node;
      })
    );

    try {
      const res = await axios.post(`${API_BASE_URL}/ask-ai`, { prompt });
      const aiResponse = res.data.response;
      setResponse(aiResponse);
      
      // Update result node with response
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === '2') {
            return { ...node, data: { ...node.data, loading: false, value: aiResponse } };
          }
          return node;
        })
      );
    } catch (error) {
      console.error('Error running flow:', error);
      alert('Failed to get AI response. Make sure the backend is running and the API key is set.');
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === '2') {
            return { ...node, data: { ...node.data, loading: false, value: 'Error: Failed to fetch response' } };
          }
          return node;
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const saveToDB = async () => {
    if (!prompt || !response) {
      alert('Run the flow first to get a response before saving.');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/save`, { prompt, response });
      alert('Successfully saved to MongoDB!');
      fetchHistory();
    } catch (error) {
      console.error('Error saving to DB:', error);
      alert('Failed to save to database.');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/history`);
      setHistory(res.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  return (
    <div className="app-container">
      <div className="toolbar">
        <h1 className="title">AI Flow Visualization</h1>
        <div className="button-group">
          <button onClick={runFlow} disabled={loading} className="btn btn-primary">
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Play className="h-5 w-5" />}
            Run Flow
          </button>
          <button onClick={saveToDB} className="btn btn-secondary">
            <Save className="h-5 w-5" />
            Save to DB
          </button>
          <button onClick={() => { setShowHistory(!showHistory); fetchHistory(); }} className="btn btn-outline">
            <History className="h-5 w-5" />
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="flow-wrapper">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInit}
            nodeTypes={nodeTypes}
            fitView
          >
            <Background color="#aaa" gap={16} />
            <Controls />
          </ReactFlow>
        </div>

        {showHistory && (
          <div className="history-sidebar">
            <h2 className="history-title">History</h2>
            <div className="history-list">
              {history.length === 0 ? (
                <p className="no-history">No history found.</p>
              ) : (
                history.map((item) => (
                  <div key={item._id} className="history-item">
                    <p className="history-prompt"><strong>Q:</strong> {item.prompt}</p>
                    <p className="history-response"><strong>A:</strong> {item.response.substring(0, 100)}...</p>
                    <small className="history-date">{new Date(item.timestamp).toLocaleString()}</small>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
