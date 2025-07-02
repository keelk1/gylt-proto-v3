"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function GyltHeader() {
  return (
    <div className="text-center mb-8 relative">
      <div className="flex justify-center items-center mb-2">
        <div className="flex items-center">
          {/* GYLT name as image */}
          <div className="w-[180px] relative">
            <Image src="/images/gylt-name.png" alt="GYLT" width={180} height={80} className="object-contain" priority />
          </div>

          {/* GYLT logo as animated SVG */}
          <motion.div
            className="ml-3 -mt-8"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          >
            <div className="w-[80px]">
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {/* Sparkle lines */}
                <line x1="10" y1="10" x2="5" y2="5" stroke="black" strokeWidth="1" />
                <line x1="15" y1="5" x2="10" y2="0" stroke="black" strokeWidth="1" />
                <line x1="90" y1="90" x2="95" y2="95" stroke="black" strokeWidth="1" />
                <line x1="85" y1="95" x2="90" y2="100" stroke="black" strokeWidth="1" />

                {/* Diamond shape */}
                <polygon points="50,10 90,50 50,90 10,50" fill="#7DE3A0" stroke="black" strokeWidth="3" />

                {/* Internal lines */}
                <line x1="50" y1="10" x2="50" y2="90" stroke="black" strokeWidth="2" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="black" strokeWidth="2" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
      <p className="text-lg italic text-[#7DE3A0]">Ye not guilty?</p>
    </div>
  )
}
