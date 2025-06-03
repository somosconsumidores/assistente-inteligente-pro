
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface FormattedMessageProps {
  content: string;
  className?: string;
}

const FormattedMessage = ({ content, className = '' }: FormattedMessageProps) => {
  const formatContent = (text: string) => {
    // Remove markdown-style formatting
    let formatted = text
      // Remove bold markers (**text** -> text)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove italic markers (*text* -> text)
      .replace(/\*(.*?)\*/g, '$1')
      // Remove bullet point markers
      .replace(/^[\s]*[•\-\*]\s+/gm, '• ')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      // Clean up line breaks
      .replace(/\n\s*\n/g, '\n\n');

    return formatted;
  };

  const parseTableContent = (text: string) => {
    const lines = text.split('\n');
    const tables: { start: number; end: number; content: string[][] }[] = [];
    let currentTable: string[][] = [];
    let tableStart = -1;

    lines.forEach((line, index) => {
      const cleanLine = line.trim();
      
      // Check if line looks like a table row (contains | characters)
      if (cleanLine.includes('|') && cleanLine.split('|').length > 2) {
        if (tableStart === -1) {
          tableStart = index;
          currentTable = [];
        }
        
        // Parse table row
        const cells = cleanLine
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '');
        
        if (cells.length > 0) {
          currentTable.push(cells);
        }
      } else if (currentTable.length > 0) {
        // End of table
        tables.push({
          start: tableStart,
          end: index - 1,
          content: currentTable
        });
        tableStart = -1;
        currentTable = [];
      }
    });

    // Handle table at the end of content
    if (currentTable.length > 0) {
      tables.push({
        start: tableStart,
        end: lines.length - 1,
        content: currentTable
      });
    }

    return { lines, tables };
  };

  const renderTable = (tableContent: string[][], key: number) => {
    if (tableContent.length === 0) return null;

    const headers = tableContent[0];
    const rows = tableContent.slice(1);

    return (
      <div key={key} className="my-4 rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-orange-50 to-red-50">
              {headers.map((header, index) => (
                <TableHead key={index} className="font-semibold text-gray-800">
                  {formatContent(header)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-gray-700">
                    {formatContent(cell)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderContent = () => {
    const { lines, tables } = parseTableContent(content);
    const elements: React.ReactNode[] = [];
    let currentLineIndex = 0;

    tables.forEach((table, tableIndex) => {
      // Add content before table
      if (currentLineIndex < table.start) {
        const beforeTableContent = lines
          .slice(currentLineIndex, table.start)
          .join('\n')
          .trim();
        
        if (beforeTableContent) {
          elements.push(
            <div key={`text-${tableIndex}`} className="whitespace-pre-wrap leading-relaxed">
              {formatContent(beforeTableContent)}
            </div>
          );
        }
      }

      // Add table
      elements.push(renderTable(table.content, tableIndex));
      currentLineIndex = table.end + 1;
    });

    // Add remaining content after last table
    if (currentLineIndex < lines.length) {
      const remainingContent = lines
        .slice(currentLineIndex)
        .join('\n')
        .trim();
      
      if (remainingContent) {
        elements.push(
          <div key="remaining" className="whitespace-pre-wrap leading-relaxed">
            {formatContent(remainingContent)}
          </div>
        );
      }
    }

    // If no tables found, just render formatted text
    if (tables.length === 0) {
      return (
        <div className="whitespace-pre-wrap leading-relaxed">
          {formatContent(content)}
        </div>
      );
    }

    return <div className="space-y-3">{elements}</div>;
  };

  return (
    <div className={`text-gray-800 ${className}`}>
      {renderContent()}
    </div>
  );
};

export default FormattedMessage;
