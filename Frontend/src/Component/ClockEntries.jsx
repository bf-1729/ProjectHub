import React, { useContext, useState, useEffect } from "react";
import { UsersContext } from "../Context/UserContext";
import { motion } from "framer-motion";
import { jwtDecode } from "jwt-decode";
export default function ClockEntries() {
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]
  );
  const {
    clockEntries,
    createClockEntry,
    syncClockEntries,
    workers,
    projects,
    token,
  } = useContext(UsersContext);
  const workersList = workers.filter((item)=>item.workerType === "Worker")
  useEffect(() => {
    if (!token) return;
    try {
      const { email } = jwtDecode(token);
      const userName = email?.split("@")[0]?.split(".")[0] || "";
      setName(userName);
    } catch (err) {
      console.error("Token decode error:", err);
    }
  }, [token]);

  console.log(name);
  

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showSyncPrompt, setShowSyncPrompt] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsynced = clockEntries.some(
      (e) => !e.synced && e.ownerToken === token
    );
    setShowSyncPrompt(unsynced && isOnline);
  }, [clockEntries, token, isOnline]);

  const totalClockIns = clockEntries.filter((e) => e.type === "clock-in")
    .length;
  const uniqueClockedWorkers = new Set(
    clockEntries.filter((e) => e.type === "clock-in").map((e) => e.worker)
  ).size;
  const attendanceRate = workers.length
    ? Math.round((uniqueClockedWorkers / workers.length) * 100)
    : 0;

  const getLastEntry = (workerName) =>
    [...clockEntries]
      .reverse()
      .find((e) => e.worker.toLowerCase() === workerName.toLowerCase());

  // Filter clock entries for selected date
  const entriesForSelectedDay = clockEntries.filter(
    (entry) =>
      new Date(entry.time).toISOString().split("T")[0] === selectedDate
  );

  // Reduce clock entries to rows with clock-in/out pairs
  const tableRows = entriesForSelectedDay
    .sort((a, b) => new Date(a.time) - new Date(b.time))
    .reduce((acc, entry) => {
      if (entry.type === "clock-in") {
        acc.push({
          worker: entry.worker,
          project: entry.project,
          clockIn: entry.synced
            ? new Date(entry.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Waiting",
          clockInSynced: entry.synced,
          clockOut: "-",
          clockOutSynced: true,
        });
      } else if (entry.type === "clock-out") {
        const lastRow = acc
          .slice()
          .reverse()
          .find(
            (r) =>
              r.worker === entry.worker &&
              r.project === entry.project &&
              r.clockOut === "-"
          );
        if (lastRow) {
          lastRow.clockOut = entry.synced
            ? new Date(entry.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Waiting";
          lastRow.clockOutSynced = entry.synced;
        } else {
          acc.push({
            worker: entry.worker,
            project: entry.project,
            clockIn: "-",
            clockInSynced: true,
            clockOut: entry.synced
              ? new Date(entry.time).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Waiting",
            clockOutSynced: entry.synced,
          });
        }
      }
      return acc;
    }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-100 min-h-screen py-10 px-6 mt-26">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-8">
        <div>
          <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Time Clock Dashboard
          </p>
          <p className="text-gray-600 mt-1">
            Monitor and manage worker attendance in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap mt-4 sm:mt-0">
          <select className="border border-gray-300 rounded-lg px-3 py-2 shadow-sm bg-white">
            {projects.map((proj, i) => (
              <option key={i} value={proj.projectName}>
                {proj.projectName}
              </option>
            ))}
          </select>
          {showSyncPrompt ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={syncClockEntries}
              className="px-4 py-2 rounded-xl bg-blue-500 text-white shadow hover:bg-blue-600 transition"
            >
              Sync
            </motion.button>
          ) : (
            <span
              className={`px-4 py-2 rounded-xl text-white ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          icon="https://img.icons8.com/ultraviolet/40/workers-male.png"
          title="Total Workers"
          value={workersList.length}
          gradient="from-blue-400 to-indigo-500"
        />
        <StatCard
          icon="https://img.icons8.com/windows/32/228BE6/check-document.png"
          title="Total Check-ins"
          value={totalClockIns}
          gradient="from-green-400 to-teal-500"
        />
        <StatCard
          icon="https://img.icons8.com/windows/32/228BE6/checked-user-male--v1.png"
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          gradient="from-yellow-400 to-orange-500"
        />
      </div>

      {/* Worker Actions & Recent Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Worker Actions */}
        <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-3xl shadow-lg p-6 lg:col-span-1">
          <p className="text-xl font-bold text-gray-800 mb-4">Worker Actions</p>
          <input
            type="text"
            placeholder="Search worker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {workers
  .filter((item) => item.workerType === "Worker")
  .filter((worker) =>
    worker.Name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  .sort((a, b) =>
    a.Name.toLowerCase().localeCompare(b.Name.toLowerCase())
  )
  .map((worker, index) => {
    const lastEntry = getLastEntry(worker.Name);
    const isClockedIn = lastEntry?.type === "clock-in";
    const assignedProject = projects.find(
      (p) => p.projectName === lastEntry?.project
    );
    const clockInTime =
      isClockedIn && lastEntry?.time
        ? new Date(lastEntry.time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null;

    // ✅ Enable only for logged-in worker
    const isCurrentWorker =
      worker.Name.toLowerCase() === name.toLowerCase();

    return (
      <div
        key={index}
        className="flex justify-between items-center mb-4 last:mb-0"
      >
        <div className="flex flex-col">
          <span className="font-semibold text-gray-700 capitalize">
            {worker.Name}
          </span>
          {!lastEntry && (
            <span className="text-xs text-green-500">Available</span>
          )}
          {isClockedIn && lastEntry && (
            <div className="text-xs text-gray-600 mt-1">
              <p>
                <span className="font-semibold text-blue-600">Project:</span>{" "}
                {assignedProject?.projectName || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-green-600">Clocked In:</span>{" "}
                {clockInTime}
              </p>
            </div>
          )}
        </div>

        <div>
          {!isClockedIn ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                if (window.confirm(`Clock in ${worker.Name}?`)) {
                  createClockEntry({
                    worker: worker.Name,
                    project: projects[0]?.projectName || "N/A",
                    type: "clock-in",
                  });
                }
              }}
              disabled={!isCurrentWorker} // ✅ disable for others
              className={`px-3 py-1 rounded-xl font-semibold shadow transition ${
                isCurrentWorker
                  ? "bg-green-700 text-white rounded hover:bg-blue-800"
                  : "bg-green-200 text-gray-500 rounded cursor-not-allowed"
              }`}
            >
              Clock In
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                if (window.confirm(`Clock out ${worker.Name}?`)) {
                  createClockEntry({
                    worker: worker.Name,
                    project:
                      assignedProject?.projectName ||
                      projects[0]?.projectName,
                    type: "clock-out",
                  });
                }
              }}
              disabled={!isCurrentWorker} // ✅ disable for others
              className={`px-3 py-1 rounded-xl font-semibold shadow transition ${
                isCurrentWorker
                  ? "bg-red-200 text-red-800 rounded hover:bg-red-300"
                  : "bg-gray-200 text-gray-400 rounded cursor-not-allowed"
              }`}
            >
              Clock Out
            </motion.button>
          )}
        </div>
      </div>
    );
  })}

        </div>

        {/* Recent Entries Table */}
        <div className="bg-white/70 backdrop-blur-md border border-gray-200 rounded-3xl shadow-lg p-6 lg:col-span-2 overflow-auto max-h-[600px]">
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-gray-800 mb-4">Recent Entries</p>

          {/* Date Picker */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-3 py-2 rounded-lg shadow-sm mb-4"
          />
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-400">
              <tr>
                <th className="py-2 px-3 font-semibold text-gray-700">
                  WORKER
                </th>
                <th className="py-2 px-3 font-semibold text-gray-700">
                  PROJECT
                </th>
                <th className="py-2 px-3 font-semibold text-gray-700">
                  CLOCK IN
                </th>
                <th className="py-2 px-3 font-semibold text-gray-700">
                  CLOCK OUT
                </th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50"
                >
                  <td className="py-2 px-3 text-gray-800">
                    {row.worker.toLowerCase()}
                  </td>
                  <td className="py-2 px-3 text-gray-800">{row.project}</td>
                  <td
                    className={`py-2 px-3 font-medium ${
                      row.clockInSynced ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {row.clockIn}
                  </td>
                  <td
                    className={`py-2 px-3 font-medium ${
                      row.clockOutSynced ? "text-red-600" : "text-yellow-600"
                    }`}
                  >
                    {row.clockOut}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Stat Card -------------------- */
function StatCard({ icon, title, value, gradient }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`flex items-center p-4 rounded-3xl shadow-lg bg-white/70 backdrop-blur-md border border-gray-200`}
    >
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white text-xl shadow-md mr-4`}
      >
        <img src={icon} alt={title} className="w-6 h-6" />
      </div>
      <div>
        <p className="text-gray-600 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </motion.div>
  );
}
