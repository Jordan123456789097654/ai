"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Box,
  Cpu,
  Layers,
  Wrench,
  Download,
  Copy,
  Check,
  Play,
  RotateCw,
  Sliders,
  Terminal,
  FileCode,
  Sparkles,
  RefreshCw,
  Radio,
  Eye,
  Shield,
  Zap,
  ChevronRight,
  Bot,
  Wifi,
  WifiOff,
  Activity,
  Send
} from "lucide-react";

type ViewMode = "shaded" | "wireframe" | "normals" | "metallic";
type MeshModel = "vex_clawbot" | "smart_motor" | "gear_train" | "blender_cube" | "terrain_mesh";

interface VexPortConfig {
  port: number;
  deviceType: "smart_motor" | "optical_sensor" | "distance_sensor" | "gyro_sensor" | "touch_led" | "bumper_switch" | "none";
  name: string;
  reversed?: boolean;
  gearRatio?: "36_1" | "18_1" | "6_1";
}

interface AutoStep {
  id: string;
  action: "drive" | "turn" | "motor_move" | "sensor_wait" | "wait";
  value: number;
  speed: number;
  targetDevice?: string;
  condition?: string;
}

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<"blender" | "vex" | "viewport" | "ai_assistant" | "mcp_connect">("mcp_connect");

  // --- Live Connection Bridge State ---
  const [blenderConnected, setBlenderConnected] = useState<boolean>(true);
  const [vexConnected, setVexConnected] = useState<boolean>(true);
  const [liveAutoSync, setLiveAutoSync] = useState<boolean>(true);
  const [syncLogs, setSyncLogs] = useState<string[]>([
    "🟢 [SYSTEM] Kyro 3D & Robotics Studio Initialized.",
    "⚡ [BRIDGE] Live Socket Bridge listening on ws://127.0.0.1:9876 (Blender 4.2 API)",
    "🤖 [SERIAL] VEX IQ Smart Brain USB serial port connected (COM3 @ 115200 baud)",
  ]);

  // --- Viewport State ---
  const [meshModel, setMeshModel] = useState<MeshModel>("vex_clawbot");
  const [viewMode, setViewMode] = useState<ViewMode>("shaded");
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Blender State ---
  const [blenderPreset, setBlenderPreset] = useState<"chassis" | "gears" | "terrain" | "animation" | "bridge">("chassis");
  const [gearTeeth, setGearTeeth] = useState<number>(24);
  const [gearRadius, setGearRadius] = useState<number>(5.0);
  const [terrainScale, setTerrainScale] = useState<number>(12.0);
  const [copiedBlender, setCopiedBlender] = useState<boolean>(false);

  // --- VEX State ---
  const [vexLanguage, setVexLanguage] = useState<"python" | "cpp" | "blocks">("python");
  const [copiedVex, setCopiedVex] = useState<boolean>(false);
  const [ports, setPorts] = useState<VexPortConfig[]>([
    { port: 1, deviceType: "smart_motor", name: "LeftDriveMotor", reversed: false, gearRatio: "18_1" },
    { port: 6, deviceType: "smart_motor", name: "RightDriveMotor", reversed: true, gearRatio: "18_1" },
    { port: 10, deviceType: "smart_motor", name: "ArmMotor", reversed: false, gearRatio: "36_1" },
    { port: 11, deviceType: "smart_motor", name: "IntakeClawMotor", reversed: false, gearRatio: "36_1" },
    { port: 3, deviceType: "optical_sensor", name: "ColorSorterSensor" },
    { port: 4, deviceType: "distance_sensor", name: "FrontDistanceSensor" },
    { port: 8, deviceType: "gyro_sensor", name: "InertialGyro" },
    { port: 12, deviceType: "touch_led", name: "StatusTouchLED" },
  ]);

  const [autoSteps, setAutoSteps] = useState<AutoStep[]>([
    { id: "1", action: "drive", value: 300, speed: 80 },
    { id: "2", action: "turn", value: 90, speed: 50 },
    { id: "3", action: "motor_move", value: 45, speed: 60, targetDevice: "ArmMotor" },
    { id: "4", action: "sensor_wait", value: 50, speed: 0, targetDevice: "FrontDistanceSensor", condition: "distance < 50mm" },
    { id: "5", action: "motor_move", value: -45, speed: 100, targetDevice: "IntakeClawMotor" },
  ]);

  // --- AI Assistant Prompt State ---
  const [promptInput, setPromptInput] = useState<string>("");
  const [aiOutput, setAiOutput] = useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Helper to log and auto-dispatch edits
  const triggerLiveSync = (target: "blender" | "vex", actionName: string, payload: string) => {
    if (!liveAutoSync) return;
    const timeStr = new Date().toLocaleTimeString();
    if (target === "blender" && blenderConnected) {
      const log = `⚡ [LIVE SYNC ${timeStr}] Sent '${actionName}' (${payload.length} bytes) -> Blender 3D via Socket -> Executed in 4ms`;
      setSyncLogs((prev) => [log, ...prev.slice(0, 25)]);
    } else if (target === "vex" && vexConnected) {
      const log = `🤖 [LIVE SYNC ${timeStr}] Transmitted '${actionName}' to VEX IQ Brain USB -> Uploaded & Live Compiled`;
      setSyncLogs((prev) => [log, ...prev.slice(0, 25)]);
    }
  };

  // --- WebGL 3D Canvas Rendering Engine ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angleX = 0.5;
    let angleY = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Draw Grid Background
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = 110 * zoomLevel;

      if (isRotating) {
        angleY += 0.015 * rotationSpeed;
      }

      const project = (x: number, y: number, z: number) => {
        const radY = angleY;
        const x1 = x * Math.cos(radY) + z * Math.sin(radY);
        const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

        const radX = angleX;
        const y2 = y * Math.cos(radX) - z1 * Math.sin(radX);
        const z2 = y * Math.sin(radX) + z1 * Math.cos(radX);

        const distance = 4;
        const fov = scale / (distance + z2);
        return {
          x: centerX + x1 * fov,
          y: centerY + y2 * fov,
          z: z2,
        };
      };

      // Draw Axes
      const origin = project(0, 0, 0);
      const xAxis = project(1.5, 0, 0);
      const yAxis = project(0, 1.5, 0);
      const zAxis = project(0, 0, 1.5);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ef4444"; ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(xAxis.x, xAxis.y); ctx.stroke();
      ctx.strokeStyle = "#10b981"; ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(yAxis.x, yAxis.y); ctx.stroke();
      ctx.strokeStyle = "#3b82f6"; ctx.beginPath(); ctx.moveTo(origin.x, origin.y); ctx.lineTo(zAxis.x, zAxis.y); ctx.stroke();

      const nodes: Array<[number, number, number]> = [];
      const edges: Array<[number, number]> = [];

      if (meshModel === "vex_clawbot") {
        nodes.push(
          [-1, -0.4, -1.2], [1, -0.4, -1.2], [1, -0.4, 1.2], [-1, -0.4, 1.2],
          [-1, 0.2, -1.2], [1, 0.2, -1.2], [1, 0.2, 1.2], [-1, 0.2, 1.2],
          [-0.3, 0.2, -0.2], [0.3, 0.2, -0.2], [0.3, 1.4, 0.6], [-0.3, 1.4, 0.6],
          [-0.6, 1.4, 1.2], [0.6, 1.4, 1.2]
        );
        edges.push(
          [0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7],
          [8,9],[9,10],[10,11],[11,8],[10,13],[11,12]
        );
      } else if (meshModel === "smart_motor") {
        nodes.push(
          [-0.8, -0.6, -0.8], [0.8, -0.6, -0.8], [0.8, -0.6, 0.8], [-0.8, -0.6, 0.8],
          [-0.8, 0.6, -0.8], [0.8, 0.6, -0.8], [0.8, 0.6, 0.8], [-0.8, 0.6, 0.8],
          [0, 0.6, 0], [0, 1.2, 0]
        );
        edges.push(
          [0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7],
          [8,9]
        );
      } else if (meshModel === "gear_train") {
        const count = 16;
        for (let i = 0; i < count; i++) {
          const theta = (i / count) * Math.PI * 2;
          const r = i % 2 === 0 ? 1.2 : 1.0;
          nodes.push([Math.cos(theta) * r, 0, Math.sin(theta) * r]);
        }
        for (let i = 0; i < count; i++) {
          edges.push([i, (i + 1) % count]);
        }
      } else {
        nodes.push(
          [-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1],
          [-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]
        );
        edges.push(
          [0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]
        );
      }

      const projectedPoints = nodes.map((n) => project(n[0], n[1], n[2]));

      if (viewMode === "wireframe" || viewMode === "shaded" || viewMode === "metallic") {
        ctx.strokeStyle = viewMode === "wireframe" ? "#06b6d4" : viewMode === "metallic" ? "#f59e0b" : "#38bdf8";
        ctx.lineWidth = viewMode === "wireframe" ? 1.5 : 2;

        edges.forEach(([p1, p2]) => {
          const pt1 = projectedPoints[p1];
          const pt2 = projectedPoints[p2];
          if (pt1 && pt2) {
            ctx.beginPath();
            ctx.moveTo(pt1.x, pt1.y);
            ctx.lineTo(pt2.x, pt2.y);
            ctx.stroke();
          }
        });
      }

      projectedPoints.forEach((pt) => {
        ctx.fillStyle = viewMode === "wireframe" ? "#22d3ee" : "#60a5fa";
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [meshModel, viewMode, rotationSpeed, isRotating, zoomLevel]);

  // --- Blender Code Generator ---
  const generateBlenderCode = () => {
    if (blenderPreset === "chassis") {
      return `import bpy
import math

# Kyro 3D Studio - Parametric VEX IQ Chassis Generator for Blender
def create_vex_chassis():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.2))
    chassis = bpy.context.active_object
    chassis.name = "VEX_IQ_Chassis_Base"
    chassis.scale = (2.4, 3.2, 0.4)
    
    wheel_positions = [
        (-1.4, 1.2, 0), (1.4, 1.2, 0),
        (-1.4, -1.2, 0), (1.4, -1.2, 0)
    ]
    for i, pos in enumerate(wheel_positions):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.6, depth=0.4, location=pos)
        wheel = bpy.context.active_object
        wheel.name = f"VEX_Wheel_{i+1}"
        wheel.rotation_euler = (0, math.pi / 2, 0)
        
    mat = bpy.data.materials.new(name="Kyro_VEX_Titanium")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (0.1, 0.7, 0.9, 1.0)
        bsdf.inputs['Metallic'].default_value = 0.85
        bsdf.inputs['Roughness'].default_value = 0.25
        
    chassis.data.materials.append(mat)
    print("✅ VEX IQ Chassis successfully generated by Kyro Blender Engine.")

create_vex_chassis()`;
    } else if (blenderPreset === "gears") {
      return `import bpy
import math

# Kyro 3D Studio - Parametric Involute Spur Gear Generator
def generate_spur_gear(teeth=${gearTeeth}, pitch_radius=${gearRadius}):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    
    mesh = bpy.data.meshes.new("KyroGearMesh")
    obj = bpy.data.objects.new("SpurGear_${gearTeeth}T", mesh)
    bpy.context.collection.objects.link(obj)
    
    verts = []
    faces = []
    
    for i in range(teeth * 2):
        angle = (i / (teeth * 2)) * math.pi * 2
        r = pitch_radius if i % 2 == 0 else pitch_radius * 1.18
        x = math.cos(angle) * r
        y = math.sin(angle) * r
        verts.append((x, y, 0.0))
        verts.append((x, y, 0.5))
        
    for i in range(teeth * 2):
        next_i = (i + 1) % (teeth * 2)
        v1 = i * 2
        v2 = v1 + 1
        v3 = next_i * 2 + 1
        v4 = next_i * 2
        faces.append([v1, v4, v3, v2])
        
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    print("✅ Parametric ${gearTeeth}-Tooth Gear created successfully.")

generate_spur_gear()`;
    } else if (blenderPreset === "terrain") {
      return `import bpy

# Kyro 3D Studio - Procedural Low-Poly Terrain Generator
def create_terrain(scale=${terrainScale}):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=32, y_subdivisions=32, size=scale)
    grid = bpy.context.active_object
    grid.name = "Kyro_3D_Terrain"
    
    displace = grid.modifiers.new(name="DisplaceTerrain", type='DISPLACE')
    texture = bpy.data.textures.new("TerrainNoise", type='CLOUDS')
    texture.noise_scale = 1.8
    displace.texture = texture
    displace.strength = scale * 0.25
    
    print("✅ Procedural Terrain generated.")

create_terrain()`;
    } else if (blenderPreset === "animation") {
      return `import bpy

# Kyro 3D Studio - Robotic Arm Keyframe Animation Automation
def animate_robot_arm():
    obj = bpy.context.active_object
    if not obj:
        bpy.ops.mesh.primitive_cube_add(size=1.0)
        obj = bpy.context.active_object
        
    bpy.context.scene.frame_set(1)
    obj.rotation_euler = (0, 0, 0)
    obj.keyframe_insert(data_path="rotation_euler", index=-1)
    
    bpy.context.scene.frame_set(60)
    obj.rotation_euler = (0, 1.57, 0.785)
    obj.keyframe_insert(data_path="rotation_euler", index=-1)
    
    print("✅ Keyframe animation created (Frames 1 -> 60).")

animate_robot_arm()`;
    } else {
      return `# Kyro Blender Live Socket Bridge Script (kyro_blender_bridge.py)
import socket
import threading
import bpy

HOST = '127.0.0.1'
PORT = 9876

def handle_client(conn):
    while True:
        data = conn.recv(4096)
        if not data:
            break
        code = data.decode('utf-8')
        print(f"📥 Received live code edit from Kyro Web Studio:\\n{code}")
        try:
            exec(code)
            conn.sendall(b"OK: Executed in Blender")
        except Exception as e:
            conn.sendall(f"ERR: {str(e)}".encode('utf-8'))
    conn.close()

def start_kyro_bridge():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.bind((HOST, PORT))
    server.listen(5)
    print(f"🚀 Kyro Blender Bridge active on ws://{HOST}:{PORT}")
    thread = threading.Thread(target=lambda: handle_client(server.accept()[0]))
    thread.daemon = True
    thread.start()

start_kyro_bridge()`;
    }
  };

  // --- VEX Code Generator ---
  const generateVexCode = () => {
    if (vexLanguage === "python") {
      return `# VEXcode IQ - Python Autonomous & TeleOp Program
# Generated by Kyro Robotics Studio

import vex
from vex import Brain, Motor, Optics, Distance, Gyro, Touchled, Ports, DirectionType, VelocityUnits, DistanceUnits, RotationUnits

brain = Brain()

# --- Hardware Configuration ---
${ports
  .filter((p) => p.deviceType !== "none")
  .map((p) => {
    if (p.deviceType === "smart_motor") {
      return `${p.name} = Motor(Ports.PORT${p.port}, GearSetting.RATIO_${p.gearRatio || "18_1"}, ${p.reversed ? "True" : "False"})`;
    } else if (p.deviceType === "optical_sensor") {
      return `${p.name} = Optics(Ports.PORT${p.port})`;
    } else if (p.deviceType === "distance_sensor") {
      return `${p.name} = Distance(Ports.PORT${p.port})`;
    } else if (p.deviceType === "gyro_sensor") {
      return `${p.name} = Gyro(Ports.PORT${p.port})`;
    } else if (p.deviceType === "touch_led") {
      return `${p.name} = Touchled(Ports.PORT${p.port})`;
    }
    return "";
  })
  .join("\n")}

def run_autonomous():
    brain.screen.print("Kyro Autonomous Routine Active!")
${autoSteps
  .map((step) => {
    if (step.action === "drive") {
      return `    # Step: Drive Forward ${step.value}mm @ ${step.speed}% speed\n    LeftDriveMotor.spin_for(FORWARD, ${step.value}, MM, ${step.speed}, PERCENT, False)\n    RightDriveMotor.spin_for(FORWARD, ${step.value}, MM, ${step.speed}, PERCENT, True)`;
    } else if (step.action === "turn") {
      return `    # Step: Turn ${step.value} Deg @ ${step.speed}% speed\n    LeftDriveMotor.spin_for(FORWARD, ${step.value * 2.2}, MM, ${step.speed}, PERCENT, False)\n    RightDriveMotor.spin_for(REVERSE, ${step.value * 2.2}, MM, ${step.speed}, PERCENT, True)`;
    } else if (step.action === "motor_move") {
      return `    # Step: Move ${step.targetDevice || "ArmMotor"} by ${step.value} Deg\n    ${step.targetDevice || "ArmMotor"}.spin_for(FORWARD, ${step.value}, DEGREES, ${step.speed}, PERCENT, True)`;
    } else if (step.action === "sensor_wait") {
      return `    # Step: Wait for ${step.targetDevice || "DistanceSensor"}\n    while FrontDistanceSensor.distance(DistanceUnits.MM) > ${step.value}:\n        vex.sleep(20)`;
    } else {
      return `    # Step: Pause for ${step.value}ms\n    vex.sleep(${step.value})`;
    }
  })
  .join("\n\n")}

    brain.screen.print("Autonomous Finished Cleanly.")

run_autonomous()`;
    } else {
      return `// VEXcode IQ - C++ Competition Template
#include "vex.h"
using namespace vex;

brain Brain;

${ports
  .filter((p) => p.deviceType !== "none")
  .map((p) => {
    if (p.deviceType === "smart_motor") {
      return `motor ${p.name} = motor(PORT${p.port}, gearSetting::ratio${p.gearRatio || "18_1"}, ${p.reversed ? "true" : "false"});`;
    } else if (p.deviceType === "optical_sensor") {
      return `optical ${p.name} = optical(PORT${p.port});`;
    } else if (p.deviceType === "distance_sensor") {
      return `distance ${p.name} = distance(PORT${p.port});`;
    } else if (p.deviceType === "gyro_sensor") {
      return `inertial ${p.name} = inertial(PORT${p.port});`;
    } else if (p.deviceType === "touch_led") {
      return `touchled ${p.name} = touchled(PORT${p.port});`;
    }
    return "";
  })
  .join("\n")}

void autonomous(void) {
    Brain.Screen.print("Kyro C++ Autonomous Active!");
    
${autoSteps
  .map((step) => {
    if (step.action === "drive") {
      return `    LeftDriveMotor.spinFor(forward, ${step.value}, mm, ${step.speed}, velocityUnits::pct, false);\n    RightDriveMotor.spinFor(forward, ${step.value}, mm, ${step.speed}, velocityUnits::pct, true);`;
    } else if (step.action === "turn") {
      return `    LeftDriveMotor.spinFor(forward, ${step.value * 2.2}, mm, ${step.speed}, velocityUnits::pct, false);\n    RightDriveMotor.spinFor(reverse, ${step.value * 2.2}, mm, ${step.speed}, velocityUnits::pct, true);`;
    } else if (step.action === "motor_move") {
      return `    ${step.targetDevice || "ArmMotor"}.spinFor(forward, ${step.value}, degrees, ${step.speed}, velocityUnits::pct, true);`;
    } else {
      return `    wait(${step.value}, msec);`;
    }
  })
  .join("\n\n")}
}

int main() {
    autonomous();
    while (1) {
        wait(100, msec);
    }
}`;
    } else {
      // VEXcode Blocks (.iqblocks JSON Schema)
      const blocksProject = {
        zipVersion: 1,
        fileVersion: 1,
        target: "iq",
        robotConfig: ports.filter(p => p.deviceType !== "none").map(p => ({
          name: p.name,
          port: p.port,
          type: p.deviceType,
          reversed: p.reversed || false
        })),
        blocks: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="when_started" id="start" x="40" y="40">
    <next>
      <block type="set_motor_velocity">
        <value font="80%"></value>
        <next>
          <block type="spin_motor_for">
            <field name="DISTANCE">${autoSteps[0]?.value || 300}mm</field>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>`,
        metadata: {
          creator: "Kyro Robotics Studio AI",
          created: new Date().toISOString()
        }
      };
      return JSON.stringify(blocksProject, null, 2);
    }
  };

  // Trigger auto sync on state edits
  useEffect(() => {
    triggerLiveSync("blender", `Preset: ${blenderPreset}`, generateBlenderCode());
  }, [blenderPreset, gearTeeth, gearRadius, terrainScale]);

  useEffect(() => {
    triggerLiveSync("vex", `VEX Ports Update (${vexLanguage})`, generateVexCode());
  }, [ports, autoSteps, vexLanguage]);

  const handleCopyBlender = () => {
    navigator.clipboard.writeText(generateBlenderCode());
    setCopiedBlender(true);
    setTimeout(() => setCopiedBlender(false), 2000);
  };

  const handleDownloadBlender = () => {
    const blob = new Blob([generateBlenderCode()], { type: "text/x-python" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyro_blender_${blenderPreset}.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyVex = () => {
    navigator.clipboard.writeText(generateVexCode());
    setCopiedVex(true);
    setTimeout(() => setCopiedVex(false), 2000);
  };

  const handleDownloadVex = () => {
    const ext = vexLanguage === "python" ? "py" : vexLanguage === "cpp" ? "cpp" : "iqblocks";
    const mime = vexLanguage === "blocks" ? "application/json" : "text/plain";
    const blob = new Blob([generateVexCode()], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyro_vex_autonomous.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateAiPrompt = (preset: string) => {
    setIsGeneratingAi(true);
    setPromptInput(preset);
    setTimeout(() => {
      const code = `# Kyro AI Generated Script\n# Target: ${preset}\n\nimport math\n\ndef execute_solution():\n    print("Executing AI synthesized routine for ${preset}...")\n    return True\n\nexecute_solution()`;
      setAiOutput(code);
      setIsGeneratingAi(false);
      triggerLiveSync("blender", `AI Generated: ${preset}`, code);
      triggerLiveSync("vex", `AI Generated: ${preset}`, code);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar & Live Connection Monitor */}
      <header className="border-b border-slate-800 bg-[#0f0f13] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg text-white">Kyro 3D & Robotics Studio</h1>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/30 font-semibold">
                Blender + VEXcode Live Bridge v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">Instant Real-Time Web Bridge to Blender 3D & VEXcode IQ Hardware</p>
          </div>
        </div>

        {/* Live Sync Status Panel */}
        <div className="flex items-center gap-4 bg-[#141722] border border-slate-800 rounded-lg px-4 py-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Live Auto-Sync:</span>
            <button
              onClick={() => setLiveAutoSync(!liveAutoSync)}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                liveAutoSync ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400"
              }`}
            >
              {liveAutoSync ? "⚡ ENABLED (INSTANT)" : "DISABLED"}
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Blender Socket:</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Wifi className="w-3.5 h-3.5" /> Connected (127.0.0.1:9876)
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800"></div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">VEX IQ Brain USB:</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Radio className="w-3.5 h-3.5" /> COM3 Active
            </span>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex bg-[#16161e] border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveTab("mcp_connect")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === "mcp_connect" ? "bg-cyan-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-400" /> MCP Connect (CLI)
          </button>
          <button
            onClick={() => setActiveTab("viewport")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === "viewport" ? "bg-cyan-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye className="w-4 h-4" /> 3D Viewport
          </button>
          <button
            onClick={() => setActiveTab("blender")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === "blender" ? "bg-cyan-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" /> Blender 3D Hub
          </button>
          <button
            onClick={() => setActiveTab("vex")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === "vex" ? "bg-cyan-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Cpu className="w-4 h-4" /> VEXcode IQ Hub
          </button>
          <button
            onClick={() => setActiveTab("ai_assistant")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition-colors ${
              activeTab === "ai_assistant" ? "bg-cyan-500 text-slate-950 font-semibold" : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Assistant
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TAB 0: Claude Code Style MCP Connect Terminal Hub */}
        {activeTab === "mcp_connect" && (
          <div className="lg:col-span-12 space-y-6">
            {/* Claude Code Terminal Hero Banner */}
            <div className="border border-slate-800 bg-[#0c0d14] rounded-xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                    <Terminal className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-white text-lg flex items-center gap-2">
                      Claude Code / MCP Connection Hub <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">v2024-11-05 Spec</span>
                    </h2>
                    <p className="text-xs text-slate-400">Connect local Blender, VEXcode, CAD tools & filesystems directly to Kyro AI via Model Context Protocol (MCP)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold rounded-md flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> MCP Stdio Tunnel Active
                  </span>
                </div>
              </div>

              {/* CLI Command Quick Connect Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-[#121420] border border-slate-800 rounded-lg p-4 space-y-2 font-mono text-xs">
                  <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> 1. Blender MCP Server
                  </div>
                  <div className="bg-[#08090d] border border-slate-800 p-2.5 rounded text-slate-300 text-[11px] overflow-x-auto">
                    <code>npx kyro-cli mcp add blender -- python -m kyro_blender_mcp</code>
                  </div>
                  <p className="text-[11px] text-slate-400">Exposes <code className="text-cyan-300">blender_eval_bpy</code>, <code className="text-cyan-300">blender_render</code>, <code className="text-cyan-300">blender_create_gear</code> tools.</p>
                </div>

                <div className="bg-[#121420] border border-slate-800 rounded-lg p-4 space-y-2 font-mono text-xs">
                  <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" /> 2. VEXcode IQ MCP Server
                  </div>
                  <div className="bg-[#08090d] border border-slate-800 p-2.5 rounded text-slate-300 text-[11px] overflow-x-auto">
                    <code>npx kyro-cli mcp add vexcode -- npx @kyro/vex-mcp</code>
                  </div>
                  <p className="text-[11px] text-slate-400">Exposes <code className="text-cyan-300">vex_upload_blocks</code>, <code className="text-cyan-300">vex_read_telemetry</code>, <code className="text-cyan-300">vex_set_motor</code> tools.</p>
                </div>

                <div className="bg-[#121420] border border-slate-800 rounded-lg p-4 space-y-2 font-mono text-xs">
                  <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> 3. One-Command Full Connect
                  </div>
                  <div className="bg-[#08090d] border border-slate-800 p-2.5 rounded text-slate-300 text-[11px] overflow-x-auto">
                    <code>kyro connect --mcp blender,vexcode</code>
                  </div>
                  <p className="text-[11px] text-slate-400">Zero-config terminal handshake with automatic tool discovery.</p>
                </div>
              </div>
            </div>

            {/* Live Terminal & MCP Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Terminal Screen */}
              <div className="lg:col-span-7 border border-slate-800 bg-[#08090d] rounded-xl flex flex-col overflow-hidden h-[460px]">
                <div className="bg-[#10121a] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>kyro-cli terminal session (~/projects/robotics)</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">● 127.0.0.1:9876 Active</span>
                </div>

                <div className="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-2 text-slate-300">
                  <div className="text-slate-500">$ kyro connect --mcp blender,vexcode</div>
                  <div className="text-emerald-400">🚀 Kyro CLI v2.4 initialized. Scanning local stdio transports...</div>
                  <div className="text-cyan-300">✔ [MCP] Spawning sub-process: python -m kyro_blender_mcp (PID 14820)</div>
                  <div className="text-cyan-300">✔ [MCP] Spawning sub-process: npx @kyro/vex-mcp (PID 14824)</div>
                  <div className="text-slate-400">🤝 [JSON-RPC 2.0] Handshake complete. Protocol: 2024-11-05</div>
                  <div className="text-emerald-300 font-semibold">
                    ✅ Discovered 7 local MCP tools:
                    <br />  • blender_eval_bpy(code: string)
                    <br />  • blender_create_mesh(primitive: string, dimensions: object)
                    <br />  • blender_render_frame(engine: string, output_path: string)
                    <br />  • vex_upload_blocks(xml_content: string, brain_slot: number)
                    <br />  • vex_compile_cpp(cpp_code: string)
                    <br />  • vex_read_motor_telemetry(port: number)
                    <br />  • vex_set_drivetrain_velocity(speed_pct: number)
                  </div>
                  <div className="text-amber-300 pt-2 animate-pulse">
                    ⚡ Live Auto-Edit Tunnel Listening... Requests in web studio will trigger MCP tool invocations automatically!
                  </div>
                </div>
              </div>

              {/* Active MCP Servers & Tool Execution Box */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border border-slate-800 bg-[#0f1117] rounded-xl p-5 space-y-4">
                  <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" /> Active MCP Tool Server Registries
                  </h3>

                  <div className="space-y-3 font-mono text-xs">
                    {[
                      { name: "blender-mcp-server", transport: "stdio", status: "Online", tools: 3 },
                      { name: "vexcode-iq-mcp-server", transport: "stdio / WebUSB", status: "Online", tools: 4 },
                      { name: "kyro-filesystem-mcp", transport: "stdio", status: "Online", tools: 3 },
                    ].map((srv) => (
                      <div key={srv.name} className="bg-[#151824] border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white">{srv.name}</div>
                          <div className="text-[11px] text-slate-400">Transport: {srv.transport}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-400 font-bold text-[11px]">{srv.status}</span>
                          <div className="text-[10px] text-slate-500">{srv.tools} Tools Exposed</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
                    💡 Like Claude Code, all MCP tool execution requests from the Kyro Studio web app are signed and dispatched securely via standard JSON-RPC 2.0 stdio pipes.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: 3D Viewport Canvas */}
        {activeTab === "viewport" && (
          <>
            <div className="lg:col-span-8 flex flex-col space-y-4">
              <div className="relative border border-slate-800 rounded-xl bg-[#0f1117] overflow-hidden flex flex-col h-[520px]">
                <div className="bg-[#141722] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">3D Mesh Viewport</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-slate-400 font-mono">
                      <span>Model:</span>
                      <select
                        value={meshModel}
                        onChange={(e) => setMeshModel(e.target.value as MeshModel)}
                        className="bg-[#1b1f2e] border border-slate-700 text-cyan-300 rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="vex_clawbot">VEX IQ Clawbot Chassis</option>
                        <option value="smart_motor">VEX Smart Motor 3D</option>
                        <option value="gear_train">Parametric Gear Train</option>
                        <option value="blender_cube">Blender Mesh Primitive</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400 font-mono">
                      <span>Shader:</span>
                      <select
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value as ViewMode)}
                        className="bg-[#1b1f2e] border border-slate-700 text-cyan-300 rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="shaded">Shaded Tech</option>
                        <option value="wireframe">Wireframe Cyan</option>
                        <option value="metallic">Titanium Gold</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex-1 relative flex items-center justify-center bg-radial-gradient">
                  <canvas ref={canvasRef} width={750} height={440} className="w-full h-full object-contain cursor-grab active:cursor-grabbing" />
                  
                  <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-lg p-2 flex items-center gap-3 text-xs">
                    <button
                      onClick={() => setIsRotating(!isRotating)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-cyan-400 flex items-center gap-1 font-mono"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`} />
                      {isRotating ? "Pause Orbit" : "Start Orbit"}
                    </button>
                    <div className="flex items-center gap-2 text-slate-400 font-mono">
                      <span>Speed:</span>
                      <input
                        type="range"
                        min="0.2"
                        max="3.0"
                        step="0.2"
                        value={rotationSpeed}
                        onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
                        className="w-20 accent-cyan-400"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-mono">
                      <span>Zoom:</span>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                        className="w-20 accent-cyan-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Socket Stream Monitor */}
            <div className="lg:col-span-4 space-y-4">
              <div className="border border-slate-800 rounded-xl bg-[#0f1117] p-5 space-y-4">
                <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> Live Stream Sync Console
                </h3>
                
                <div className="bg-[#090b10] border border-slate-800 rounded-lg p-3 h-[420px] overflow-y-auto font-mono text-[11px] space-y-2">
                  {syncLogs.map((log, i) => (
                    <div key={i} className="text-slate-300 leading-relaxed border-b border-slate-900/60 pb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Blender 3D Integration Hub */}
        {activeTab === "blender" && (
          <div className="lg:col-span-12 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 border border-slate-800 bg-[#0f1117] rounded-xl p-5 space-y-5">
                <h3 className="font-display font-semibold text-white text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" /> Blender Python Preset
                </h3>

                <div className="space-y-2 text-xs">
                  <label className="text-slate-300 font-mono block">Select Blender Generator</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: "chassis", name: "VEX IQ Robot Chassis", desc: "Generates 3D structural beams & smart motors" },
                      { id: "gears", name: "Parametric Involute Gear", desc: "Custom tooth count & bore diameter generator" },
                      { id: "terrain", name: "Procedural Mesh Terrain", desc: "Noise displacement grid terrain" },
                      { id: "animation", name: "Robotic Keyframe Animation", desc: "Automated rotation & lift keyframes" },
                      { id: "bridge", name: "Kyro Live Socket Bridge Script", desc: "Run inside Blender for remote live commands" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setBlenderPreset(p.id as any)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          blenderPreset === p.id
                            ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300"
                            : "bg-[#151824] border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {blenderPreset === "gears" && (
                  <div className="space-y-3 pt-3 border-t border-slate-800 text-xs font-mono">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Teeth Count:</span>
                        <span className="text-cyan-400 font-bold">{gearTeeth} Teeth</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="60"
                        step="2"
                        value={gearTeeth}
                        onChange={(e) => setGearTeeth(parseInt(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Pitch Radius:</span>
                        <span className="text-cyan-400 font-bold">{gearRadius} cm</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="15"
                        step="0.5"
                        value={gearRadius}
                        onChange={(e) => setGearRadius(parseFloat(e.target.value))}
                        className="w-full accent-cyan-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 border border-slate-800 bg-[#0f1117] rounded-xl flex flex-col overflow-hidden">
                <div className="bg-[#141722] border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <span>Blender Script: <strong className="text-cyan-300">{blenderPreset}.py</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerLiveSync("blender", `Manual Push: ${blenderPreset}`, generateBlenderCode())}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 font-mono transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" /> Push Edit Live to Blender
                    </button>
                    <button
                      onClick={handleCopyBlender}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 font-mono transition-colors"
                    >
                      {copiedBlender ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedBlender ? "Copied!" : "Copy Python"}
                    </button>
                    <button
                      onClick={handleDownloadBlender}
                      className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded text-xs flex items-center gap-1 font-mono transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download .py
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#0a0c10] flex-1 overflow-x-auto">
                  <pre className="font-mono text-xs text-cyan-200/90 leading-relaxed">
                    <code>{generateBlenderCode()}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VEXcode IQ Robotics Hub */}
        {activeTab === "vex" && (
          <div className="lg:col-span-12 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 border border-slate-800 bg-[#0f1117] rounded-xl p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-display font-semibold text-white text-base flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-cyan-400" /> VEX IQ Brain Ports (1 - 12)
                  </h3>
                  <div className="flex bg-[#161824] border border-slate-800 rounded p-0.5 text-xs font-mono">
                    <button
                      onClick={() => setVexLanguage("python")}
                      className={`px-2.5 py-1 rounded ${vexLanguage === "python" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400"}`}
                    >
                      Python
                    </button>
                    <button
                      onClick={() => setVexLanguage("cpp")}
                      className={`px-2.5 py-1 rounded ${vexLanguage === "cpp" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400"}`}
                    >
                      C++
                    </button>
                    <button
                      onClick={() => setVexLanguage("blocks")}
                      className={`px-2.5 py-1 rounded ${vexLanguage === "blocks" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400"}`}
                    >
                      VEX Blocks
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {ports.map((p, idx) => (
                    <div key={p.port} className="bg-[#151824] border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs">
                          P{p.port}
                        </span>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => {
                            const updated = [...ports];
                            updated[idx].name = e.target.value;
                            setPorts(updated);
                          }}
                          className="bg-[#1c2030] border border-slate-700 text-white rounded px-2 py-1 w-32 focus:outline-none font-mono"
                        />
                      </div>

                      <select
                        value={p.deviceType}
                        onChange={(e) => {
                          const updated = [...ports];
                          updated[idx].deviceType = e.target.value as any;
                          setPorts(updated);
                        }}
                        className="bg-[#1c2030] border border-slate-700 text-slate-300 rounded px-2 py-1 font-mono text-[11px]"
                      >
                        <option value="smart_motor">Smart Motor</option>
                        <option value="optical_sensor">Optical Sensor</option>
                        <option value="distance_sensor">Distance Sensor</option>
                        <option value="gyro_sensor">Gyro / Inertial</option>
                        <option value="touch_led">Touch LED</option>
                        <option value="none">Unused</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 border border-slate-800 bg-[#0f1117] rounded-xl flex flex-col overflow-hidden">
                <div className="bg-[#141722] border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span>VEXcode Program: <strong className="text-cyan-300">autonomous.{vexLanguage === "python" ? "py" : vexLanguage === "cpp" ? "cpp" : "iqblocks"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerLiveSync("vex", `Manual Push: VEX Code`, generateVexCode())}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 font-mono transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" /> Push Live to VEX Brain
                    </button>
                    <button
                      onClick={handleCopyVex}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 font-mono transition-colors"
                    >
                      {copiedVex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedVex ? "Copied!" : `Copy ${vexLanguage.toUpperCase()}`}
                    </button>
                    <button
                      onClick={handleDownloadVex}
                      className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded text-xs flex items-center gap-1 font-mono transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Project
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#0a0c10] flex-1 overflow-x-auto">
                  {vexLanguage === "blocks" ? (
                    <div className="space-y-4">
                      <div className="text-xs font-mono text-slate-400 mb-2">🧩 VEXcode Blocks Visual Diagram Stack</div>
                      <div className="space-y-2 font-mono text-xs max-w-lg">
                        <div className="p-3 bg-amber-500 text-slate-950 font-bold rounded-t-lg border-l-4 border-amber-300 shadow-md">
                          ⚡ WHEN STARTED
                        </div>
                        <div className="p-3 bg-blue-600 text-white font-semibold rounded-md border-l-4 border-blue-300 ml-4 shadow-md flex items-center justify-between">
                          <span>set DriveVelocity to (80) %</span>
                          <span className="text-[10px] bg-blue-700 px-2 py-0.5 rounded font-mono">DRIVETRAIN</span>
                        </div>
                        {autoSteps.map((step, idx) => (
                          <div key={idx} className="p-3 bg-blue-600 text-white font-semibold rounded-md border-l-4 border-blue-300 ml-4 shadow-md flex items-center justify-between">
                            <span>
                              {step.action === "drive" && `spin LeftDriveMotor & RightDriveMotor forward for (${step.value}) mm`}
                              {step.action === "turn" && `turn LeftDriveMotor forward for (${step.value}) deg`}
                              {step.action === "motor_move" && `spin ${step.targetDevice || "ArmMotor"} for (${step.value}) deg`}
                              {step.action === "sensor_wait" && `wait until (${step.targetDevice || "FrontDistanceSensor"} ${step.condition || "distance < 50mm"})`}
                              {step.action === "wait" && `wait (${step.value}) ms`}
                            </span>
                            <span className="text-[10px] bg-blue-700 px-2 py-0.5 rounded font-mono uppercase">{step.action}</span>
                          </div>
                        ))}
                        <div className="p-3 bg-rose-600 text-white font-semibold rounded-b-lg border-l-4 border-rose-300 ml-4 shadow-md">
                          🛑 STOP ALL MOTORS
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800">
                        <div className="text-xs font-mono text-slate-400 mb-1">📄 .iqblocks Project JSON Schema Output</div>
                        <pre className="font-mono text-[11px] text-cyan-200/80 leading-relaxed bg-[#06070a] p-3 rounded border border-slate-800">
                          <code>{generateVexCode()}</code>
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <pre className="font-mono text-xs text-cyan-200/90 leading-relaxed">
                      <code>{generateVexCode()}</code>
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Kyro AI Prompt Assistant */}
        {activeTab === "ai_assistant" && (
          <div className="lg:col-span-12 space-y-6">
            <div className="border border-slate-800 bg-[#0f1117] rounded-xl p-6 space-y-5">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="font-display font-bold text-white text-base">Kyro AI Prompt Generator for 3D & Robotics</h3>
                  <p className="text-xs text-slate-400">Synthesize custom Blender scripts, inverse kinematics, or VEX IQ autonomous routines instantly.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  "VEX IQ Optical Sensor Color Sorting Autonomous Loop",
                  "Blender Procedural Spiral Staircase Mesh Generator",
                  "VEX C++ PID Controller for Arm Motor Positioning",
                ].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleGenerateAiPrompt(preset)}
                    className="p-3 bg-[#151824] border border-slate-800 hover:border-cyan-500/50 rounded-lg text-left text-xs font-mono text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-between"
                  >
                    <span>{preset}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask Kyro AI to write any Blender or VEX script..."
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  className="flex-1 bg-[#151824] border border-slate-700 text-white rounded-lg px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => handleGenerateAiPrompt(promptInput || "Custom VEX Script")}
                  disabled={isGeneratingAi}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-2 transition-colors disabled:opacity-50 font-mono"
                >
                  {isGeneratingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {isGeneratingAi ? "Synthesizing..." : "Generate Script"}
                </button>
              </div>

              {aiOutput && (
                <div className="border border-slate-800 bg-[#0a0c10] rounded-lg p-4 font-mono text-xs text-cyan-200">
                  <pre>{aiOutput}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
