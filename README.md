# DEMO SETUP CORS PROCESS COOKIE TO CROSS DOMAIN 
## Setup lab
1. Setup Main_service
- Sử dụng ngrok để tạo cross domain.
```bash
ngrok http 3000
```
![](http://note.bksec.vn/pad/uploads/8c590218-d40b-4b77-9a42-58d9f401cec7.png)

Chỉnh domain tạo bởi ngrok ở `index.js` của API
```js
const corsOptions = {
    origin: 'https://399b-118-70-236-135.ngrok-free.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));

// Thêm middleware xử lý CORS trước các routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://399b-118-70-236-135.ngrok-free.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
```
Chạy Main_service:
```bash
git clone https://github.com/dungNHVhust/Demo_fetch_cross_origin.git

cd Demo_fetch_cross_origin/Main_service

npm install

npm start
```

2. Setup API
```bash
cd Demo_fetch_cross_origin/API_01

npm install

npm start
```

## Cấu hình CORS:
### Ở Main_service:
Cấu hình token :
```js
res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/',
        maxAge: 3600000
    });
```

Cấu hình fetch API:
```js
async function callAPI1() {
            showLoading(1);
            try {
                const response = await fetch('http://localhost:3001/api/v1/auth', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    mode: 'cors',
                    withCredentials: true
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'API call failed');
                }

                const data = await response.json();
                showResponse(1, data);
            } catch (error) {
                console.error('Error details:', error);  // Debug log
                showResponse(1, { 
                    error: error.message,
                    details: 'Please make sure server is running !!!'
                });
            } finally {
                hideLoading(1);
            }
        }
```

### Ở API
```js
// CORS configuration - chấp nhận request từ domain ngrok của Main service
const corsOptions = {
    origin: 'https://399b-118-70-236-135.ngrok-free.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));

// Thêm middleware xử lý CORS trước các routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://399b-118-70-236-135.ngrok-free.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
```

