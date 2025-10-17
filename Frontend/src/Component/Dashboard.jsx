import React, { useContext, useMemo } from "react";
import { UsersContext } from "../Context/UserContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { projects, workers, clockEntries } = useContext(UsersContext);

  const workersList = workers.filter((item) => item.workerType === "Worker");
  const last = clockEntries[clockEntries.length - 1];
  const worker = last?.worker || "No recent activity";
  const clocks = last?.type || "";
  const project = last?.project || "";

  const onProject = useMemo(() => {
    const busyWorkers = new Set();
    projects.forEach((project) => {
      if (project.projectStatus === "active") {
        project.assignedWorkers?.forEach((worker) => {
          busyWorkers.add(worker.Name);
        });
      }
    });
    return busyWorkers.size;
  }, [projects]);

  const active = projects.filter((item) => item.projectStatus === "active");

  const dashboardStats = [
    { title: "Total Projects", value: projects.length, icon: "🗂️" },
    { title: "Active Projects", value: active.length, icon: "🎯" },
    { title: "Team Members", value: workersList.length, icon: "👥" },
    { title: "Active Workers", value: onProject, icon: "⚙️" },
  ];

  return (
    <div className="p-8 z-0 mt-26 min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute w-full h-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-50 opacity-80"></div>
        <svg
          className="absolute w-full h-full"
          viewBox="0 0 1440 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#FFFFFF20"
            d="M0,160L80,154.7C160,149,320,139,480,154.7C640,171,800,213,960,208C1120,203,1280,149,1360,122.7L1440,96L1440,600L1360,600C1280,600,1120,600,960,600C800,600,640,600,480,600C320,600,160,600,80,600L0,600Z"
          />
        </svg>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center md:text-left relative z-10"
      >
        <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent mb-2 drop-shadow-lg">
          Project Management Dashboard
        </p>
        <p className="text-gray-700 text-lg drop-shadow-sm">
          Live overview of people, projects, and daily activities.
        </p>
      </motion.div>

      {/* Stats Cards with 3D effect */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 mb-10 perspective-1000 relative z-10">
        {dashboardStats.map((item, idx) => (
          <motion.div
            key={idx}
            className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-3 flex items-center justify-center border border-gray-200 transform-gpu"
            whileHover={{
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          >
            <motion.div
              className="text-3xl mb-3"
            >
              {item.icon}
            </motion.div>
            <div className="flex flex-col items-center">
            <div className="text-gray-600 mt-2 font-medium">{item.title}</div>
            <div className="text-xl font-bold text-gray-900 drop-shadow-sm">
              {item.value ?? 0}
              </div>
              </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 perspective-1000 relative z-10">
        {/* Activity Chart */}
        <motion.div
          className="md:col-span-2 bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
          }}
          transition={{ type: "spring", stiffness: 150 }}
        >
          <p className="text-2xl font-semibold mb-4 text-gray-700">
            Activity Last 7 Days
          </p>
          <div className="h-44 bg-gradient-to-r from-indigo-100 to-blue-50 rounded-xl flex items-center justify-center text-blue-300 border border-indigo-100 shadow-inner">
            [Chart Placeholder]
          </div>
        </motion.div>

        {/* Right Side Widgets */}
        <div className="flex flex-col gap-6">
          {/* Who's Online */}
          <motion.div
            className="bg-white/90 backdrop-blur-md shadow-xl rounded-3xl p-6"
            whileHover={{
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            }}
          >
            <p className="text-2xl font-semibold mb-4 text-gray-700">
              Who's Online?
            </p>
            <div className="text-center text-gray-400 mt-6">
              [No one online currently]
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            className="bg-white/90 backdrop-blur-md shadow-xl rounded-3xl p-6"
            whileHover={{
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            }}
          >
            <p className="text-2xl font-semibold mb-4 text-gray-700">
              Recent Activity
            </p>
            {last ? (
              <div className="flex items-center gap-4 text-gray-700">
                <Link
                  to="/clock_entries"
                  className="bg-indigo-100 p-2 rounded-full hover:bg-indigo-200 transition"
                >
                  <img
                    className="h-10 w-10"
                    src="https://img.icons8.com/sf-regular-filled/48/228BE6/exit.png"
                    alt="exit"
                  />
                </Link>
                <p className="text-sm">
                  <span className="font-semibold text-indigo-600">
                    {worker}
                  </span>{" "}
                  {clocks} from{" "}
                  <span className="font-semibold text-blue-600">{project}</span>
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-center">No recent activity</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
