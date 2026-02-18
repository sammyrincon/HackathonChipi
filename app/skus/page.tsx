"use client";

import { useGetSkuList } from "@chipi-stack/nextjs";
import { SkusGrid } from "@/components/skus/skus.grid";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";

const ITEMS_PER_PAGE = 12;

export default function SkusPage() {
  const { getToken } = useAuth();

  // State-based pagination (not URL-based)
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch SKUs with pagination using React Query
  const { data, error } = useGetSkuList({
    query: {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      category: "TELEFONIA",
    },
    getBearerToken: getToken,
    queryOptions: {
      staleTime: 30 * 60 * 1000, // Consider data fresh for 30 minutes
    },
  });

  // Handle page change - pure state update, no URL manipulation
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to display
  const pageNumbers = useMemo(() => {
    if (!data) return [];

    const pages: (number | "ellipsis")[] = [];
    const { page: currentPageFromData, totalPages } = data;
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPageFromData > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current page
      const start = Math.max(2, currentPageFromData - 1);
      const end = Math.min(totalPages - 1, currentPageFromData + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPageFromData < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  }, [data]);

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Browse Products</h1>
      </div>

      {/* Error State */}
      {error && (
        <div className="py-12 text-center">
          <p className="text-lg text-red-500">Failed to load products</p>
          <p className="text-muted-foreground mt-2">Please try again later</p>
        </div>
      )}

      {/* Content */}
      {data && data.data.length > 0 && (
        <>
          {/* All Products Grid */}
          <SkusGrid skus={data.data} />

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center pt-8">
              <Pagination>
                <PaginationContent>
                  {/* Previous Button */}
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (data.page > 1) {
                          handlePageChange(data.page - 1);
                        }
                      }}
                      className={
                        data.page <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      aria-disabled={data.page <= 1}
                    />
                  </PaginationItem>

                  {/* Page Numbers */}
                  {pageNumbers.map((pageNum, idx) => (
                    <PaginationItem key={`page-${pageNum}-${idx}`}>
                      {pageNum === "ellipsis" ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href="#"
                          isActive={data.page === pageNum}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  {/* Next Button */}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (data.page < data.totalPages) {
                          handlePageChange(data.page + 1);
                        }
                      }}
                      className={
                        data.page >= data.totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                      aria-disabled={data.page >= data.totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
