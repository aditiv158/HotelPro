
import { useState } from "react";
import {
  LayoutDashboard, BedDouble, CalendarDays, Users,
  CreditCard, Settings, Search, Bell, Plus, Menu,
  CheckCircle2, Clock, LogOut, ArrowUpRight
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:5000";

async function saveBooking(guestName, room, amount) {
  const today = new Date();
  const checkIn = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkOut = tomorrow.toISOString().slice(0, 10);

  const response = await fetch(`${API_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      guestName,
      room,
      checkIn,
      checkOut,
      amount
    })
  });

  if (!response.ok) {
    throw new Error("Could not save booking");
  }

  return response.json();
}

const initialRooms = [
  { id: "101", type: "Deluxe Room", price: 2500, status: "Available" },
  { id: "102", type: "Standard Room", price: 1800, status: "Occupied" },
  { id: "103", type: "Suite Room", price: 4500, status: "Available" },
  { id: "104", type: "Deluxe Room", price: 2500, status: "Occupied" },
  { id: "105", type: "Standard Room", price: 1800, status: "Available" },
  { id: "106", type: "Suite Room", price: 4500, status: "Cleaning" },
];

const initialBookings = [
  { id: "BK001", guest: "Aarav Sharma", room: "102", date: "28 Oct 2026", amount: 5400, status: "Checked In" },
  { id: "BK002", guest: "Priya Mehta", room: "104", date: "28 Oct 2026", amount: 7500, status: "Confirmed" },
  { id: "BK003", guest: "Rohan Patel", room: "101", date: "29 Oct 2026", amount: 5000, status: "Pending" },
  { id: "BK004", guest: "Ananya Singh", room: "103", date: "29 Oct 2026", amount: 9000, status: "Confirmed" },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Room Management", icon: BedDouble },
  { label: "Bookings", icon: CalendarDays },
  { label: "Guests", icon: Users },
  { label: "Payments", icon: CreditCard },
  { label: "Settings", icon: Settings },
];

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [rooms, setRooms] = useState(initialRooms);
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [guest, setGuest] = useState("");
  const [room, setRoom] = useState("101");

  const notify = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  };

  const filteredBookings = bookings.filter((b) =>
    `${b.guest} ${b.id} ${b.room} ${b.status}`
      .toLowerCase().includes(search.toLowerCase())
  );

  
  async function addBooking(e) {
    e.preventDefault();

    if (!guest.trim()) return;

    const selectedRoom = rooms.find((r) => r.id === room);

    if (!selectedRoom || selectedRoom.status !== "Available") {
      notify("Please choose an available room.");
      return;
    }

    try {
      const saved = await saveBooking(
        guest.trim(),
        room,
        selectedRoom.price
      );

      setBookings((old) => [
        {
          id: saved._id,
          guest: saved.guestName,
          room: saved.room,
          date: saved.checkIn,
          amount: selectedRoom.price,
          status: saved.status
        },
        ...old
      ]);

      setRooms((old) =>
        old.map((r) =>
          r.id === room ? { ...r, status: "Occupied" } : r
        )
      );

      setGuest("");
      setShowForm(false);
      notify("Booking saved to MongoDB!");
    } catch (error) {
      console.error(error);
      notify("Booking failed. Check that your backend is running.");
    }
  }


  function toggleRoom(id) {
    setRooms((old) => old.map((r) =>
      r.id === id
        ? { ...r, status: r.status === "Available" ? "Occupied" : "Available" }
        : r
    ));
    notify("Room status updated.");
  }

  const available = rooms.filter((r) => r.status === "Available").length;
  const occupied = rooms.filter((r) => r.status === "Occupied").length;
  const revenue = bookings.reduce((sum, b) => sum + b.amount, 0);

  function statusClass(status) {
    if (["Available", "Confirmed", "Checked In", "Paid"].includes(status)) return "green";
    if (["Pending", "Cleaning"].includes(status)) return "orange";
    return "blue";
  }

  function renderBookings() {
    return (
      <div className="panel table-panel">
        <div className="panel-heading">
          <div>
            <h3>Recent Bookings</h3>
            <p>Manage and track guest reservations</p>
          </div>
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            <Plus size={17} /> New booking
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>BOOKING ID</th><th>GUEST NAME</th><th>ROOM</th><th>CHECK-IN</th><th>AMOUNT</th><th>STATUS</th></tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr key={b.id}>
                  <td className="booking-id">{b.id}</td>
                  <td><div className="guest-cell"><span className="avatar">{b.guest.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>{b.guest}</div></td>
                  <td>Room {b.room}</td>
                  <td>{b.date}</td>
                  <td>₹{b.amount.toLocaleString("en-IN")}</td>
                  <td><span className={`status ${statusClass(b.status)}`}>{b.status}</span></td>
                </tr>
              ))}
              {filteredBookings.length === 0 && <tr><td colSpan="6" className="empty">No matching bookings found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon"><BedDouble size={23} /></div>
          <div><strong>HotelPro</strong><small>MANAGEMENT SUITE</small></div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${page === label ? "active" : ""}`}
              onClick={() => { setPage(label); setMenuOpen(false); }}>
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
              {label === "Bookings" && <span className="nav-count">{bookings.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">✦</div>
            <strong>Need some help?</strong>
            <p>We're here to help you manage your hotel.</p>
            <button onClick={() => notify("Contact your hotel administrator for support.")}>Contact support ↗</button>
          </div>
          <div className="profile">
            <div className="profile-avatar">AD</div>
            <div className="profile-info"><strong>Admin User</strong><small>Hotel Administrator</small></div>
            <button className="logout" title="Sign out" onClick={() => notify("Demo mode: sign-in is not connected.")}><LogOut size={17} /></button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}><Menu /></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{page}</strong></div>
          <div className="top-actions">
            <div className="search-box"><Search size={17} /><input placeholder="Search bookings..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <button className="bell-btn" onClick={() => notify("You're all caught up!")}><Bell size={19} /><i /></button>
            <div className="top-avatar">AD</div>
          </div>
        </header>

        <div className="content">
          {page === "Dashboard" && <>
            <div className="welcome-row">
              <div><div className="eyebrow">TUESDAY, 28 OCTOBER 2026</div><h1>Good evening, Admin <span>✦</span></h1><p>Here's what's happening at your hotel today.</p></div>
              <button className="primary-btn" onClick={() => setShowForm(true)}><Plus size={18} /> Create booking</button>
            </div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-top"><span>Total Rooms</span><div className="stat-icon purple"><BedDouble size={20} /></div></div><div className="stat-number">{rooms.length}</div><div className="stat-foot"><span className="positive"><ArrowUpRight size={15} /> {available} available</span><span>room inventory</span></div></div>
              <div className="stat-card"><div className="stat-top"><span>Occupied Rooms</span><div className="stat-icon blue"><Users size={20} /></div></div><div className="stat-number">{occupied}<small> / {rooms.length}</small></div><div className="stat-foot"><span className="positive">{Math.round(occupied / rooms.length * 100)}%</span><span>occupancy rate</span></div><div className="progress"><span style={{width: `${occupied / rooms.length * 100}%`}} /></div></div>
              <div className="stat-card"><div className="stat-top"><span>Total Bookings</span><div className="stat-icon orange"><CalendarDays size={20} /></div></div><div className="stat-number">{bookings.length}</div><div className="stat-foot"><span className="positive"><ArrowUpRight size={15} /> Active</span><span>reservations</span></div></div>
              <div className="stat-card"><div className="stat-top"><span>Booking Value</span><div className="stat-icon green"><CreditCard size={20} /></div></div><div className="stat-number money">₹{revenue.toLocaleString("en-IN")}</div><div className="stat-foot"><span className="positive">Demo data</span><span>booking total</span></div></div>
            </div>

            <div className="section-title"><div><h2>Room Overview</h2><p>Live room inventory at a glance</p></div><button className="text-btn" onClick={() => setPage("Room Management")}>View all rooms <ArrowUpRight size={16}/></button></div>
            <div className="room-grid">
              {rooms.slice(0, 4).map((r) => <div className="room-card" key={r.id}><div className="room-art"><BedDouble size={31}/><span>ROOM {r.id}</span></div><div className="room-info"><div><strong>{r.type}</strong><p>Room {r.id}</p></div><span className={`status ${statusClass(r.status)}`}>{r.status}</span></div><div className="room-price">₹{r.price.toLocaleString("en-IN")} <small>/ night</small></div></div>)}
            </div>
            {renderBookings()}
          </>}

          {page === "Room Management" && <>
            <div className="welcome-row"><div><div className="eyebrow">INVENTORY</div><h1>Room Management</h1><p>Monitor rooms and update their availability.</p></div><span className="status green">{available} rooms available</span></div>
            <div className="room-grid room-grid-all">{rooms.map((r) => <div className="room-card" key={r.id}><div className="room-art"><BedDouble size={31}/><span>ROOM {r.id}</span></div><div className="room-info"><div><strong>{r.type}</strong><p>Room {r.id}</p></div><span className={`status ${statusClass(r.status)}`}>{r.status}</span></div><div className="room-price">₹{r.price.toLocaleString("en-IN")} <small>/ night</small></div><button className="secondary-btn" onClick={() => toggleRoom(r.id)}>{r.status === "Available" ? "Mark occupied" : "Mark available"}</button></div>)}</div>
          </>}

          {page === "Bookings" && <><div className="welcome-row"><div><div className="eyebrow">RESERVATIONS</div><h1>Bookings</h1><p>All reservations in one place.</p></div><button className="primary-btn" onClick={() => setShowForm(true)}><Plus size={18}/> New booking</button></div>{renderBookings()}</>}

          {page === "Guests" && <><div className="welcome-row"><div><div className="eyebrow">GUEST DIRECTORY</div><h1>Guest Management</h1><p>Guests associated with your reservations.</p></div></div><div className="guest-grid">{[...new Map(bookings.map(b => [b.guest,b])).values()].map((b) => <div className="panel guest-card" key={b.guest}><div className="large-avatar">{b.guest.split(" ").map(n=>n[0]).join("").slice(0,2)}</div><h3>{b.guest}</h3><p>Booking {b.id}</p><div className="guest-detail"><span>Room</span><strong>{b.room}</strong></div><div className="guest-detail"><span>Reservation</span><span className={`status ${statusClass(b.status)}`}>{b.status}</span></div></div>)}</div></>}

          {page === "Payments" && <><div className="welcome-row"><div><div className="eyebrow">FINANCIAL OVERVIEW</div><h1>Payments</h1><p>Review booking values and payment tracking.</p></div></div><div className="panel table-panel"><div className="panel-heading"><div><h3>Booking payment records</h3><p>Amounts shown are demo values, not processed payments.</p></div></div><div className="table-scroll"><table><thead><tr><th>BOOKING ID</th><th>GUEST</th><th>ROOM</th><th>AMOUNT</th><th>PAYMENT STATUS</th></tr></thead><tbody>{filteredBookings.map(b=><tr key={b.id}><td className="booking-id">{b.id}</td><td>{b.guest}</td><td>{b.room}</td><td>₹{b.amount.toLocaleString("en-IN")}</td><td><span className="status orange">Unverified</span></td></tr>)}</tbody></table></div></div></>}

          {page === "Settings" && <><div className="welcome-row"><div><div className="eyebrow">PREFERENCES</div><h1>Settings</h1><p>HotelPro application information.</p></div></div><div className="panel settings-panel"><div className="settings-mark"><BedDouble size={28}/></div><h2>HotelPro Management Suite</h2><p>A hotel management dashboard demo built with React.</p><div className="setting-row"><span>Application</span><strong>HotelPro</strong></div><div className="setting-row"><span>Frontend</span><strong>React + Vite</strong></div><div className="setting-row"><span>Data storage</span><strong>Temporary local state</strong></div><div className="setting-row"><span>Backend connection</span><span className="status orange">Not connected</span></div></div></>}
        </div>
        <footer>© 2026 HotelPro · Hotel Management System <span><CheckCircle2 size={14}/> Demo environment</span></footer>
      </main>

      {notice && <div className="toast"><CheckCircle2 size={18}/>{notice}</div>}

      {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><form className="booking-modal" onSubmit={addBooking} onClick={(e) => e.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowForm(false)}>×</button><div className="eyebrow">RESERVATIONS</div><h2>Create a booking</h2><p>Add a guest and select an available room.</p><label>Guest full name<input autoFocus value={guest} onChange={(e)=>setGuest(e.target.value)} placeholder="Enter guest name" required/></label><label>Select room<select value={room} onChange={(e)=>setRoom(e.target.value)}>{rooms.filter(r=>r.status==="Available").map(r=><option key={r.id} value={r.id}>Room {r.id} · {r.type} · ₹{r.price}</option>)}</select></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>setShowForm(false)}>Cancel</button><button type="submit" className="primary-btn">Confirm booking</button></div></form></div>}
    </div>
  );
}
