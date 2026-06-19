type Props = {
  name: string;
  photoUrl: string | null;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
};

export default function PlayerAvatar({ name, photoUrl, size = "md" }: Props) {
  const sizeClass = sizes[size];

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border border-gray-700`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-green-500 flex items-center justify-center text-black font-bold border border-gray-700`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}