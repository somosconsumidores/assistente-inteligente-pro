
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
    // Decode HTML entities and fix encoding issues
    let formatted = text
      // Fix common encoding issues
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€/g, '"')
      .replace(/â€¢/g, '•')
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã¢/g, 'â')
      .replace(/Ãª/g, 'ê')
      .replace(/Ã´/g, 'ô')
      .replace(/Ã§/g, 'ç')
      .replace(/Ã /g, 'à')
      // Remove markdown formatting completely
      .replace(/#{1,6}\s*/g, '')  // Remove # headers
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold **text**
      .replace(/\*(.*?)\*/g, '$1')  // Remove italic *text*
      .replace(/^[\s]*[•\-\*]\s+/gm, '• ')  // Clean bullet points
      .replace(/\s+/g, ' ')  // Clean multiple spaces
      .replace(/\n\s*\n/g, '\n\n');  // Clean line breaks

    return formatted;
  };

  const parseTableContent = (text: string) => {
    const lines = text.split('\n');
    const tables: { start: number; end: number; content: string[][] }[] = [];
    let currentTable: string[][] = [];
    let tableStart = -1;

    lines.forEach((line, index) => {
      const cleanLine = line.trim();
      
      // Check if line is a separator row (|---|---|)
      const isSeparatorRow = /^\|[\s\-:|]+\|$/.test(cleanLine);
      
      // Check if line looks like a table row (contains | characters)
      if (!isSeparatorRow && cleanLine.includes('|') && cleanLine.split('|').length > 2) {
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
