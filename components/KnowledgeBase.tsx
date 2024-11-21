import { useState } from 'react';
import { Card } from './ui/card';

interface KnowledgeBaseProps {
    onResultSelect: (result: any) => void;
}

export default function KnowledgeBase({ onResultSelect }: KnowledgeBaseProps) {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const searchKnowledgeBase = async (query: string) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/knowledge-base?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.results) {
                setResults(data.results);
            }
        } catch (error) {
            console.error('Error searching knowledge base:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatResult = (result: any) => {
        return (
            <Card 
                key={`${result.section}-${result.match}`}
                className="p-4 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onResultSelect(result)}
            >
                <div className="font-semibold text-sm">{result.section}</div>
                <div className="text-sm mt-1">{result.match}</div>
            </Card>
        );
    };

    return {
        searchKnowledgeBase,
        loading,
        results,
        ResultsList: () => (
            <div className="space-y-2">
                {results.map(formatResult)}
            </div>
        )
    };
}
