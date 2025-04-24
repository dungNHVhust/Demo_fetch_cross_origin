# Demo Cấu hình CORS và chia sẻ Cookie cross-domain bằng ngrok

## Giới thiệu

Demo này hướng dẫn cách cấu hình CORS để có thể chia sẻ Cookie (đã set HttpOnly) giữa các domain khác nhau, sử dụng ngrok để giả lập cross-domain trong môi trường phát triển 
(Main_service ở domain `xxxx-xxx-xx-xxx-xxx.ngrok-free.app` có thể chia sẻ Cookie (đã set HttpOnly) với API ở `localhost:3001`)

## Tại sao sử dụng ngrok?

**Ngrok** là công cụ giúp tạo nhanh một domain công khai từ localhost. Nó đặc biệt hữu ích khi:

- Kiểm thử các API cần giả lập cross-domain.
- Phát triển frontend/backend không cùng một domain trong môi trường local.

## Cách sử dụng ngrok

Chạy lệnh dưới đây để tạo domain từ localhost đang chạy trên port `3000`:

```bash
ngrok http 3000
```

Kết quả sẽ hiển thị tương tự:
![](http://note.bksec.vn/pad/uploads/8c590218-d40b-4b77-9a42-58d9f401cec7.png)

Copy domain được tạo bởi ngrok để sử dụng cho cấu hình CORS ở bước tiếp theo.

---

## Cài đặt và chạy Demo

### 1. Main\_service

```bash
git clone https://github.com/dungNHVhust/Demo_fetch_cross_origin.git
cd Demo_fetch_cross_origin/Main_service
npm install
npm start
```


### 2. API\_service

**Chỉnh domain từ ngrok trong file **`index.js`** của API:**

```javascript
const corsOptions = {
    origin: 'https://399b-118-70-236-135.ngrok-free.app', // domain từ ngrok
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));

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

```bash
cd Demo_fetch_cross_origin/API_01
npm install
npm start
```

Cấu hình CORS tương tự như Main\_service với domain từ ngrok.

---

## Giải thích cấu hình CORS và Cookie

### Cấu hình Cookie (HttpOnly)

Cookie được cấu hình `HttpOnly` giúp bảo vệ cookie khỏi truy cập từ JavaScript phía client, nhưng vẫn cho phép cookie tự động gửi kèm với request nếu domain khớp hoặc được cấu hình đúng CORS.

```javascript
res.cookie('jwt', token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
    maxAge: 3600000
});
```

`sameSite: 'none'` :
- Cho phép cookie gửi kèm với tất cả các request cross-domain.

- Khi cấu hình `sameSite: 'none'`, bắt buộc phải set thêm `secure: true` .

`secure: true` :
- Cookie chỉ được gửi qua HTTPS.

- Bắt buộc khi set `sameSite: 'none'` nhằm đảm bảo cookie được bảo mật khi gửi qua mạng.

`path: '/'` :

- Cookie được gửi kèm với tất cả các request đến bất kỳ đường dẫn nào của domain đang cấu hình cookie.
Ví dụ: `/api/v1/auth` , `/user/login`

### Gửi Cookie trong fetch API

Khi gọi API, cấu hình `credentials: 'include'` để cookie tự động được gửi kèm request.

```javascript
async function callAPI1() {
    showLoading(1);
    try {
        const response = await fetch('http://localhost:3001/api/v1/auth', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            mode: 'cors',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'API call failed');
        }

        const data = await response.json();
        showResponse(1, data);
    } catch (error) {
        console.error('Error details:', error);
        showResponse(1, { error: error.message, details: 'Please make sure server is running !!!' });
    } finally {
        hideLoading(1);
    }
}
```

### CORS Configuration:
```js
const corsOptions = {
    origin: 'https://399b-118-70-236-135.ngrok-free.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));
```

`origin` :
- Chỉ định domain cụ thể được phép gọi đến API này.

- Chỉ các request từ domain này mới được server chấp nhận.

`credentials: true` :

- Cho phép gửi cookie hoặc thông tin chứng thực như header `Authorization` kèm theo request cross-domain.

`methods` :

- Các phương thức HTTP được phép sử dụng khi thực hiện request.

`allowedHeaders` :

- Các header được phép gửi từ client sang server.

### Middleware cấu hình header thủ công:
```js
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
Tương tự cấu hình CORS nhưng là thủ công, cấu hình này thường dùng khi cần set các giá trị chi tiết hơn hoặc debug rõ ràng hơn.

`Access-Control-Allow-Origin` :

- Chỉ định rõ ràng domain được phép truy cập.

`Access-Control-Allow-Credentials` :

- Xác nhận server chấp nhận các request chứa thông tin chứng thực (cookie, token, headers xác thực).

`Access-Control-Allow-Headers` :

- Chỉ rõ các header server cho phép client gửi.

`Access-Control-Allow-Methods` :

- Liệt kê các method HTTP server chấp nhận khi client gọi đến.


---

## Kết quả

Với cấu hình trên, có thể thực hiện gọi API cross-domain mà vẫn nhận được cookie từ domain chính (đã set HttpOnly), miễn là các domain được cấu hình đúng trong CORS.

