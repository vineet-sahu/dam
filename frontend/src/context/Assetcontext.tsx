import React, { createContext, useContext, useState, ReactNode } from "react";
interface AssetFilters {
  type?: "image" | "video" | "document" | "audio" | "all";
  visibility?: "private" | "team" | "public";
  tags?: string[];
}

interface AssetContextType {
  filter: AssetFilters;
  setFilter: React.Dispatch<React.SetStateAction<AssetFilters>>;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  itemsPerPage: number;
  setItemsPerPage: React.Dispatch<React.SetStateAction<number>>;
}

export const AssetContext = createContext<AssetContextType | undefined>(
  undefined,
);

export const AssetProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [filter, setFilter] = useState<AssetFilters>({ type: "all" });
  const [sortBy, setSortBy] = useState<string>("createdAt:desc");
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);

  return (
    <AssetContext.Provider
      value={{
        filter,
        setFilter,
        sortBy,
        setSortBy,
        search,
        setSearch,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};

export const useAssetContext = () => {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error("useAssetContext must be used within an AssetProvider");
  }
  return context;
};
