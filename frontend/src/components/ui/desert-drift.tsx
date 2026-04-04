import { cn } from "@/lib/utils";

export const Component = () => {
  return (
    <div
      className={cn(
        "flex h-[460px] w-full items-center justify-center rounded-[2rem] bg-black p-4 sm:h-[540px]"
      )}
    >
      <div className="h-full w-full max-w-5xl overflow-hidden rounded-[1.5rem] border border-gray-700 shadow-2xl">
        <iframe
          src="https://my.spline.design/untitled-k1KQe1bIq5W7lZvLark2ZzGe/"
          className="h-full w-full"
          frameBorder="0"
          allowFullScreen
          title="CVOS desert drift"
        />
      </div>
    </div>
  );
};
