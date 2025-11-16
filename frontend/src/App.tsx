import React, { useState, useEffect } from 'react';
import './App.css';
import { ClipboardService } from './services/ClipboardService';
import { SocketService } from './services/SocketService';

const App: React.FC = () => {
  const [content, setContent] = useState<{ id: string, content: string, type: 'text' | 'file', fileName?: string, mimeType?: string, createdAt: Date } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isGuest, setIsGuest] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Initialize the app
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setIsGuest(false);
    } else {
      setIsLoggedIn(false);
      setIsGuest(true);
    }

    // Connect to socket
    SocketService.connect();

    // Listen for clipboard updates
    SocketService.onClipboardUpdate((data) => {
      setSyncStatus('内容已更新，同步中...');
      // Update content with the received data immediately for responsiveness
      const formattedData = formatDataWithDates(data);
      setContent(formattedData);

      setSyncStatus('同步完成');
      setTimeout(() => setSyncStatus(null), 2000);
    });

    // Load initial content
    loadInitialContent();

    return () => {
      SocketService.disconnect();
    };
  }, []);

  const loadInitialContent = async () => {
    try {
      if (isGuest) {
        const data = await ClipboardService.getLatestGuest();
        if (data) {
          const formattedData = formatDataWithDates(data);
          setContent(formattedData);
        }
      } else {
        const token = localStorage.getItem('token');
        if (token) {
          const data = await ClipboardService.getLatest(token);
          if (data) {
            const formattedData = formatDataWithDates(data);
            setContent(formattedData);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load initial content:', error);
    }
  };

  const handlePaste = async () => {
    try {
      // Try to read from clipboard directly - modern browsers may allow this in more contexts
      const text = await navigator.clipboard.readText();

      if (text) {
        // Save to clipboard service
        let result;
        if (isGuest) {
          result = await ClipboardService.createGuest(text, 'text');
        } else {
          const token = localStorage.getItem('token');
          if (token) {
            result = await ClipboardService.create(text, 'text', token);
          }
        }

        if (result) {
          setContent({
            ...result,
            createdAt: new Date(result.createdAt)
          });
          setSyncStatus('已同步');
          setTimeout(() => setSyncStatus(null), 2000);

          // Emit socket event to notify other clients
          SocketService.emitClipboardUpdate(result);
        }
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error);

      // If clipboard access is denied, provide a user-friendly prompt
      // and let the user decide what to do
      const userChoice = confirm('无法直接读取剪贴板，是否要手动输入内容？\n点击"确定"输入文本，点击"取消"上传文件。');

      if (userChoice) {
        // User wants to input text manually
        const text = prompt('请输入要同步的内容：');
        if (text) {
          let result;
          if (isGuest) {
            result = await ClipboardService.createGuest(text, 'text');
          } else {
            const token = localStorage.getItem('token');
            if (token) {
              result = await ClipboardService.create(text, 'text', token);
            }
          }

          if (result) {
            const formattedResult = formatDataWithDates(result);
            setContent(formattedResult);
            setSyncStatus('已同步');
            setTimeout(() => setSyncStatus(null), 2000);

            // Emit socket event to notify other clients
            SocketService.emitClipboardUpdate(formattedResult);
          }
        }
      } else {
        // User wants to upload a file instead - show file input
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            await handleFileUpload(file);
          }
        };
        input.click();
      }
    }
  };

  const handleCopy = async () => {
    if (!content) return;
    
    if (content.type === 'text') {
      try {
        await navigator.clipboard.writeText(content.content);
        setSyncStatus('已复制到剪贴板');
        setTimeout(() => setSyncStatus(null), 2000);
      } catch (error) {
        console.error('Failed to copy text:', error);
      }
    } else if (content.type === 'file') {
      // For files, we'll trigger a download instead of copying
      let fileUrl = content.content;
      // Ensure the file URL is properly formatted
      if (fileUrl) {
        // Check if it's already a full URL
        if (fileUrl.startsWith('http')) {
          // Already a full URL, use as is
        } else if (fileUrl.startsWith('/')) {
          // Is a root-relative path - assume it's already correctly formatted
          // If it's not starting with /api/files/, it might need adjustment
          fileUrl = fileUrl;
        } else {
          // Is a relative path, prepend with /api/files/
          fileUrl = `/api/files/${fileUrl}`;
        }
      } else {
        // If content is empty, we can't download
        setSyncStatus('文件无法下载');
        setTimeout(() => setSyncStatus(null), 2000);
        return;
      }

      const link = document.createElement('a');
      link.href = fileUrl;
      // Use the actual file name from the stored fileName field, not derived from the URL
      const fileName = content.fileName || fileUrl.split('/').pop() || 'download';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSyncStatus('文件已下载');
      setTimeout(() => setSyncStatus(null), 2000);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadProgress(0);

    try {
      let result;
      if (isGuest) {
        result = await ClipboardService.uploadGuestFile(file, (progress) => {
          setUploadProgress(progress);
        });
      } else {
        const token = localStorage.getItem('token');
        if (token) {
          result = await ClipboardService.uploadFile(file, token, (progress) => {
            setUploadProgress(progress);
          });
        }
      }

      if (result) {
        // Update content immediately for responsiveness
        setContent({
          ...result,
          createdAt: new Date(result.createdAt)
        });
        setSyncStatus('文件已上传并同步');
        setTimeout(() => setSyncStatus(null), 2000);

        // Emit socket event to notify all clients (including this one)
        SocketService.emitClipboardUpdate(result);
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await ClipboardService.login(username, password);
      if (result.token) {
        localStorage.setItem('token', result.token);
        setIsLoggedIn(true);
        setIsGuest(false);
        setShowLoginModal(false); // Close modal on successful login
        setLoginError('');

        // Load user's content
        const data = await ClipboardService.getLatest(result.token);
        if (data) {
          const formattedData = formatDataWithDates(data);
          setContent(formattedData);
        }
      }
    } catch (error: any) {
      setLoginError(error.message || '登录失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsGuest(true);
    setContent(null);
    setHistory([]);
  };

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setLoginError(''); // Clear any previous errors
  };

  // Function to return appropriate icon based on file type
  const getFileIcon = (mimeType: string | undefined, fileName: string | undefined) => {
    if (!mimeType && !fileName) return '📁';

    if (mimeType) {
      if (mimeType.startsWith('image/')) return '🖼️';
      if (mimeType.startsWith('audio/')) return '🎵';
      if (mimeType.startsWith('video/')) return '🎬';
      if (mimeType === 'application/pdf') return '📄';
      if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
      if (mimeType.includes('msword') || mimeType.includes('openxmlformats-officedocument')) return '📝';
      if (mimeType.includes('text')) return '📄';
      if (mimeType.includes('json')) return '📋';
      if (mimeType.includes('javascript') || mimeType.includes('program') || mimeType.includes('script')) return '💻';
      if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return '📦';
      if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    }

    if (fileName) {
      const lowerFileName = fileName.toLowerCase();
      if (lowerFileName.endsWith('.pdf')) return '📄';
      if (lowerFileName.endsWith('.zip') || lowerFileName.endsWith('.rar') || lowerFileName.endsWith('.7z')) return '📦';
      if (lowerFileName.endsWith('.jpg') || lowerFileName.endsWith('.jpeg') || lowerFileName.endsWith('.png') || lowerFileName.endsWith('.gif')) return '🖼️';
      if (lowerFileName.endsWith('.mp3') || lowerFileName.endsWith('.wav') || lowerFileName.endsWith('.ogg')) return '🎵';
      if (lowerFileName.endsWith('.mp4') || lowerFileName.endsWith('.avi') || lowerFileName.endsWith('.mov')) return '🎬';
      if (lowerFileName.endsWith('.doc') || lowerFileName.endsWith('.docx')) return '📝';
      if (lowerFileName.endsWith('.xls') || lowerFileName.endsWith('.xlsx')) return '📊';
      if (lowerFileName.endsWith('.txt')) return '📄';
      if (lowerFileName.endsWith('.json')) return '📋';
      if (lowerFileName.endsWith('.js') || lowerFileName.endsWith('.ts') || lowerFileName.endsWith('.py') || lowerFileName.endsWith('.java')) return '💻';
    }

    return '📁'; // Default folder icon
  };

  // Function to format date properly in China Standard Time (UTC+8)
  const formatDate = (date: any) => {
    if (!date) return 'N/A';

    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      return 'Invalid Date';
    }

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }

    // Format to Chinese locale (Shanghai timezone)
    return dateObj.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Function to format data object ensuring dates are correct and fields are properly mapped
  const formatDataWithDates = (data: any) => {
    if (!data) return data;

    // Create a copy of the data object to avoid mutation
    // Convert snake_case fields to camelCase
    const formattedData = {
      ...data,
      createdAt: data.created_at || data.createdAt || data.createdAt,
      fileName: data.file_name || data.fileName || null,
      mimeType: data.mime_type || data.mimeType || null,
      content: data.content || null,
      id: data.id || null,
      type: data.type || null,
      isGuest: data.is_guest || data.isGuest || null
    };

    // Handle the date conversion specifically
    const timestamp = data.created_at || data.createdAt;

    if (timestamp) {
      let dateObj: Date;

      if (timestamp instanceof Date) {
        dateObj = timestamp;
      } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        // Handle different date string formats
        dateObj = new Date(timestamp);
        // Handle MySQL datetime format (YYYY-MM-DD HH:mm:ss)
        if (isNaN(dateObj.getTime()) && typeof timestamp === 'string') {
          // Convert MySQL datetime string to ISO format
          const isoStr = timestamp.replace(' ', 'T') + '.000Z';
          dateObj = new Date(isoStr);
        }
      } else {
        dateObj = new Date();
      }

      if (isNaN(dateObj.getTime())) {
        dateObj = new Date();
      }

      // Use camelCase for the frontend
      formattedData.createdAt = dateObj;
    } else {
      // If no timestamp found, use current date
      formattedData.createdAt = new Date();
    }

    return formattedData;
  };


  const loadHistory = async () => {
    if (!isLoggedIn) return;

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const historyData = await ClipboardService.getHistory(token);
        setHistory(historyData.map((item: any) => {
          return formatDataWithDates(item);
        }));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const loadHistoryItem = async (id: string) => {
    if (!isLoggedIn) return;

    try {
      const token = localStorage.getItem('token');
      if (token) {
        const result = await ClipboardService.setHistoryAsLatest(id, token);
        // Update the current display with the loaded history item
        if (result) {
          const formattedResult = formatDataWithDates(result);
          setContent(formattedResult);
          setSyncStatus('历史记录已加载');
          setTimeout(() => setSyncStatus(null), 2000);

          // Emit socket event to notify other clients
          SocketService.emitClipboardUpdate(formattedResult);
        }
        loadHistory(); // Refresh history
      }
    } catch (error) {
      console.error('Failed to load history item:', error);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    if (!isLoggedIn) return;
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await ClipboardService.deleteHistory(id, token);
        loadHistory(); // Refresh history
      }
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>传输助手</h1>
        {isLoggedIn ? (
          <div className="user-info">
            <span>用户: {username}</span>
            <button onClick={handleLogout} className="btn btn-secondary">退出</button>
          </div>
        ) : (
          <div className="user-actions">
            <span onClick={openLoginModal} style={{ cursor: 'pointer', fontSize: '1.5em' }} title="登录/注册">
              👤
            </span>
          </div>
        )}
      </header>

      <main className="app-main">
        <div className="controls">
          <button onClick={handlePaste} className="btn btn-primary">粘贴</button>
          <button onClick={handleCopy} className="btn btn-secondary" disabled={!content}>复制</button>
          {isLoggedIn && (
            <button onClick={loadHistory} className="btn btn-secondary">查看历史</button>
          )}
        </div>

        {uploadProgress !== null && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span>{uploadProgress}%</span>
          </div>
        )}

        {syncStatus && (
          <div className="sync-status">{syncStatus}</div>
        )}

        <div className="display-box">
          {content ? (
            <div className="content-item">
              {content.type === 'text' ? (
                <div className="text-content">
                  <h3>文字内容</h3>
                  <p>{content.content}</p>
                </div>
              ) : (
                <div className="file-content">
                  <h3>文件</h3>
                  <div className="file-info">
                    <div className="file-icon">
                      {getFileIcon(content.mimeType, content.fileName)}
                    </div>
                    <div className="file-details">
                      <div className="file-name">{content.fileName}</div>
                      <div className="file-type">{content.mimeType}</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="content-meta">
                <small>更新时间: {formatDate(content.createdAt)}</small>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>暂无内容，请点击"粘贴"按钮添加内容</p>
            </div>
          )}
        </div>

        {syncStatus && (
          <div className="sync-status">
            {syncStatus}
            {syncStatus.includes('同步中') && (
              <span className="sync-indicator loading-dots"></span>
            )}
          </div>
        )}

        {history.length > 0 && (
          <div className="history-section">
            <h3>历史记录</h3>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-content">
                    {item.type === 'text' ? (
                      <span>📝 {item.content.substring(0, 50)}{item.content.length > 50 ? '...' : ''}</span>
                    ) : (
                      <span>📁 {item.fileName}</span>
                    )}
                  </div>
                  <div className="history-actions">
                    <button
                      onClick={() => loadHistoryItem(item.id)}
                      className="btn btn-small btn-secondary"
                    >
                      加载
                    </button>
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="btn btn-small btn-danger"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Login Modal */}
        <div className={`login-modal ${showLoginModal ? 'show' : ''}`}>
          <div className="login-modal-content">
            <span className="close-modal" onClick={closeLoginModal}>&times;</span>
            <h2>登录/注册</h2>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
              <input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">登录/注册</button>
            </form>
            {loginError && <div className="error">{loginError}</div>}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;