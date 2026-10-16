import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  Path,
  G,
} from "react-native-svg";
// Decorative artwork only. Never used as a map or evidence of a real viewpoint.
export default function AdventureLandscape() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 600 360"
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#86B4B8" />
          <Stop offset=".65" stopColor="#E4CC8B" />
          <Stop offset="1" stopColor="#ADC0A0" />
        </LinearGradient>
        <LinearGradient id="woods" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#47715A" />
          <Stop offset="1" stopColor="#102D25" />
        </LinearGradient>
        <LinearGradient id="stone" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#5A695F" />
          <Stop offset=".5" stopColor="#B6B29A" />
          <Stop offset=".75" stopColor="#7C8978" />
          <Stop offset="1" stopColor="#CBD0B1" />
        </LinearGradient>
      </Defs>
      <Rect width="600" height="360" fill="url(#sky)" />
      <Circle cx="420" cy="75" r="47" fill="#F6DDA0" opacity=".75" />
      <Path
        d="M0 203 Q70 118 140 180 T290 180 T460 170 T620 180 V360 H0Z"
        fill="#7F9980"
      />
      <Path
        d="M0 235 Q80 145 170 230 Q260 170 350 205 Q450 145 600 223 V360 H0Z"
        fill="#557A60"
      />
      <G fill="url(#stone)" stroke="#687965" strokeWidth="2">
        <Path d="M300 280L304 130L314 111L314 70L334 55L351 74L348 160L360 230L350 280Z" />
        <Path d="M350 286L359 172L370 148L368 103L386 81L401 94L405 182L417 269Z" />
        <Path d="M400 289L418 173L431 165L431 124L446 113L460 131L462 225L475 278Z" />
        <Path d="M270 295L270 205L285 178L298 195L304 278Z" />
      </G>
      <G fill="none" stroke="#4E6255" strokeWidth="3" opacity=".7">
        <Path d="M313 123L333 131L329 193L347 202M315 157L346 164M371 151L394 162L387 229M432 178L451 185L445 246M306 243L346 237" />
      </G>
      <Path
        d="M0 288 Q100 220 230 291 Q350 252 450 278 Q540 245 600 287 V360H0Z"
        fill="url(#woods)"
      />
      <Path
        d="M280 360Q395 321 351 303Q325 292 374 278"
        stroke="#D0B47B"
        strokeWidth="16"
        fill="none"
        opacity=".7"
      />
      {[0, 50, 105, 520, 565, 610].map((x, i) => (
        <G key={x} transform={`translate(${x},${(i % 2) * 15})`}>
          <Path d="M0 330L0 50" stroke="#273F2F" strokeWidth="10" />
          <Path
            d="M0 25L-38 112H-20L-53 170H-25L-64 235H64L25 170H53L20 112H38Z"
            fill={i % 2 ? "#234B37" : "#315A3E"}
          />
        </G>
      ))}
      <Path
        d="M0 360V326Q60 286 150 339Q210 306 250 360M430 360Q500 295 600 318V360"
        fill="#142E23"
      />
      <G fill="#D1B76F" opacity=".7">
        <Circle cx="224" cy="247" r="2" />
        <Circle cx="469" cy="259" r="2" />
        <Circle cx="491" cy="208" r="2" />
        <Circle cx="164" cy="277" r="2" />
      </G>
    </Svg>
  );
}
