# Kế Hoạch Tích Hợp Memory Gallery - Du Lịch Kỷ Niệm

## 📋 Tổng Quan Tính Năng

### ✅ Đã Có Sẵn
1. ✅ Map với các chấm địa điểm (markers)
2. ✅ Nhân vật di chuyển khi click vào marker
3. ✅ Hiển thị gallery hình ảnh cho mỗi địa điểm
4. ✅ Firebase đã được setup
5. ✅ Room management system (từ minigame)

### 🆕 Cần Thêm
1. **Room System cho Memory Gallery**
   - Tạo phòng du lịch
   - Join phòng bằng mã
   - Admin quản lý phòng
   - Đếm số người "lên xe"
   - Nút "Khởi hành" khi đủ người

2. **Synchronized Tour**
   - Tất cả người trong phòng cùng xem 1 địa điểm
   - Admin điều khiển di chuyển
   - Real-time sync vị trí nhân vật

3. **Tương Tác**
   - Thả icon cảm xúc (emoji reactions)
   - Chat bình luận theo địa điểm
   - Hiển thị real-time

## 🏗️ Kiến Trúc Giải Pháp

### Option 1: Firebase Firestore (Khuyến nghị)
**Ưu điểm:**
- Đã có sẵn trong project
- Real-time sync tốt
- Dễ tích hợp

**Tối ưu Reads/Writes:**
```typescript
// 1. Sử dụng onSnapshot với query hợp lý
// Chỉ listen khi cần, unsubscribe khi không dùng
const unsubscribe = onSnapshot(
  query(collection(db, 'tours', tourId, 'messages'), 
    orderBy('timestamp', 'desc'), 
    limit(50) // Chỉ lấy 50 tin nhắn gần nhất
  ),
  (snapshot) => { ... }
);

// 2. Batch writes cho reactions
const batch = writeBatch(db);
reactions.forEach(reaction => {
  const ref = doc(db, 'tours', tourId, 'reactions', reactionId);
  batch.set(ref, reaction, { merge: true });
});
await batch.commit();

// 3. Cache local state, chỉ sync khi thay đổi
const [localState, setLocalState] = useState();
// Chỉ write khi user thực sự tương tác
```

**Cấu trúc Database:**
```
tours/{tourId}
  - currentLocation: number (id của địa điểm hiện tại)
  - status: 'waiting' | 'traveling' | 'arrived'
  - adminId: string
  - maxPlayers: number
  - createdAt: timestamp
  
tours/{tourId}/players/{playerId}
  - name: string
  - joinedAt: timestamp
  - isReady: boolean
  
tours/{tourId}/messages/{messageId}
  - playerId: string
  - playerName: string
  - locationId: number
  - text: string
  - timestamp: timestamp
  
tours/{tourId}/reactions/{reactionId}
  - playerId: string
  - locationId: number
  - emoji: string
  - timestamp: timestamp
```

**Ước tính Reads/Writes:**
- **Reads:** ~100-200 reads/phút cho 1 phòng 30 người
  - Location sync: 1 read/phút (chỉ admin write)
  - Messages: ~50 reads/phút (nếu có 10 tin nhắn/phút)
  - Reactions: ~50 reads/phút
- **Writes:** ~20-50 writes/phút
  - Messages: 1 write/tin nhắn
  - Reactions: 1 write/reaction
  - Location: 1 write/lần di chuyển

### Option 2: Firebase Realtime Database
**Ưu điểm:**
- Rẻ hơn Firestore cho real-time
- Sync nhanh hơn
- Phù hợp cho chat/reactions

**Nhược điểm:**
- Cần setup thêm
- Query phức tạp hơn

### Option 3: Hybrid (Firestore + Local State)
**Chiến lược:**
- Firestore: Chỉ sync critical data (location, players)
- Local State: Cache messages/reactions
- Polling: Lấy messages mới mỗi 5-10 giây thay vì real-time

**Ước tính Reads:**
- ~20-30 reads/phút (giảm 80%)

## 💡 Giải Pháp Tối Ưu (Khuyến nghị)

### Hybrid Approach với Smart Caching

```typescript
// 1. Real-time chỉ cho critical data
const unsubscribeLocation = onSnapshot(
  doc(db, 'tours', tourId),
  (doc) => {
    // Chỉ sync location và status
    setCurrentLocation(doc.data()?.currentLocation);
  }
);

// 2. Polling cho messages (mỗi 5 giây)
useEffect(() => {
  const interval = setInterval(async () => {
    const snapshot = await getDocs(
      query(
        collection(db, 'tours', tourId, 'messages'),
        where('timestamp', '>', lastMessageTime),
        orderBy('timestamp', 'desc'),
        limit(20)
      )
    );
    // Append new messages
  }, 5000);
  return () => clearInterval(interval);
}, []);

// 3. Batch reactions (gộp nhiều reactions trong 1 write)
const reactionQueue = useRef([]);
const flushReactions = debounce(() => {
  const batch = writeBatch(db);
  reactionQueue.current.forEach(reaction => {
    // Batch write
  });
  batch.commit();
  reactionQueue.current = [];
}, 2000);
```

## 📊 So Sánh Chi Phí

### Firebase Firestore (Free Tier)
- **Free:** 50K reads/day, 20K writes/day
- **Blaze:** $0.06/100K reads, $0.18/100K writes

**Ước tính cho 1 tour 30 phút, 30 người:**
- Real-time: ~6,000 reads, ~900 writes
- Polling (5s): ~1,200 reads, ~900 writes
- **Tiết kiệm: 80% reads với polling**

### Alternative: Supabase (Free Tier)
- **Free:** 500MB database, 2GB bandwidth
- Real-time subscriptions miễn phí
- PostgreSQL database
- **Phù hợp nếu muốn tránh Firebase**

## 🚀 Implementation Plan

### Phase 1: Room System (1-2 ngày)
1. Tạo tour room
2. Join/Leave room
3. Admin controls
4. Player list với ready status

### Phase 2: Synchronized Tour (1 ngày)
1. Sync current location
2. Admin điều khiển di chuyển
3. Auto-sync nhân vật position

### Phase 3: Interactions (2-3 ngày)
1. Emoji reactions
2. Chat system
3. Real-time updates

### Phase 4: Optimization (1 ngày)
1. Implement polling cho messages
2. Batch writes cho reactions
3. Cache optimization

## 🎯 Khuyến Nghị

**Sử dụng Firebase Firestore với Hybrid Approach:**
1. ✅ Đã có sẵn trong project
2. ✅ Real-time cho critical data (location)
3. ✅ Polling cho messages (tiết kiệm reads)
4. ✅ Batch writes cho reactions
5. ✅ Dễ scale và maintain

**Tổng thời gian:** ~5-7 ngày development
**Chi phí:** Miễn phí với free tier (đủ cho testing), ~$1-2/tháng cho production

