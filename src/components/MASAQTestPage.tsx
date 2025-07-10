/**
 * MASAQ Integration Test Page
 * 
 * Comprehensive testing interface for validating MASAQ integration pipeline
 * and identifying critical issues by priority.
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { masaqIntegrationTest } from '@/tests/masaqIntegrationTest';
import { useMASAQData } from '@/hooks/useMASAQData';

interface TestResult {
  priority: number;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details?: string[];
  issues?: string[];
}

export function MASAQTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { priority: 1, name: 'Aggregation Rules vs MASAQ Data Alignment', status: 'pending' },
    { priority: 2, name: 'Enhancement Process Type Safety', status: 'pending' },
    { priority: 3, name: 'Grammatical Relationship Preservation', status: 'pending' },
    { priority: 4, name: 'Index Mapping Integrity', status: 'pending' }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const { dataset, isLoading, error } = useMASAQData();

  // Capture console logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      setLogs(prev => [...prev, `[LOG] ${args.join(' ')}`]);
      originalLog(...args);
    };

    console.error = (...args) => {
      setLogs(prev => [...prev, `[ERROR] ${args.join(' ')}`]);
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const updateTestStatus = (priority: number, status: TestResult['status'], details?: string[], issues?: string[]) => {
    setTestResults(prev => prev.map(test => 
      test.priority === priority 
        ? { ...test, status, details, issues }
        : test
    ));
  };

  const runPriorityTest = async (priority: number) => {
    const testNames = {
      1: 'Aggregation Rules Alignment',
      2: 'Enhancement Type Safety', 
      3: 'Relationship Preservation',
      4: 'Index Mapping Integrity'
    };

    setCurrentTest(testNames[priority as keyof typeof testNames]);
    updateTestStatus(priority, 'running');

    try {
      switch (priority) {
        case 1:
          await masaqIntegrationTest.testAggregationRulesAlignment();
          updateTestStatus(1, 'passed', ['Rules alignment validated']);
          break;
        case 2:
          await masaqIntegrationTest.testEnhancementTypeSafety();
          updateTestStatus(2, 'passed', ['Type safety validated']);
          break;
        case 3:
          await masaqIntegrationTest.testRelationshipPreservation();
          updateTestStatus(3, 'passed', ['Relationships preserved']);
          break;
        case 4:
          await masaqIntegrationTest.testIndexMappingIntegrity();
          updateTestStatus(4, 'passed', ['Index mapping validated']);
          break;
      }
    } catch (error) {
      updateTestStatus(priority, 'failed', [], [error instanceof Error ? error.message : 'Unknown error']);
    }

    setCurrentTest(null);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setLogs([]);
    
    for (let priority = 1; priority <= 4; priority++) {
      await runPriorityTest(priority);
    }
    
    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'running': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'running': return '🔄';
      default: return '⏳';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">MASAQ Integration Pipeline Test</h1>
        <p className="text-gray-600">
          Comprehensive validation of MASAQ data flow through enhancement and aggregation
        </p>
      </div>

      {/* MASAQ Dataset Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>MASAQ Dataset Status</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <Badge variant="secondary">Loading...</Badge>}
          {error && <Badge variant="destructive">Error: {error}</Badge>}
          {dataset && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {dataset.metadata.totalEntries}
                </div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {dataset.metadata.surahs.length}
                </div>
                <div className="text-sm text-gray-600">Covered Surahs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {dataset.metadata.verses.size}
                </div>
                <div className="text-sm text-gray-600">Total Verses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(dataset.metadata.morphTags).length}
                </div>
                <div className="text-sm text-gray-600">Morph Tags</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
          <CardDescription>
            Run integration tests by priority to identify and fix critical issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="min-w-[150px]"
            >
              {isRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
            </Button>
            {currentTest && (
              <Badge variant="outline" className="px-3 py-1">
                Currently: {currentTest}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid gap-4 mb-6">
        {testResults.map((test) => (
          <Card key={test.priority} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    Priority {test.priority}
                  </Badge>
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getStatusIcon(test.status)}</span>
                  <Badge className={getStatusColor(test.status)}>
                    {test.status.toUpperCase()}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runPriorityTest(test.priority)}
                    disabled={isRunning}
                  >
                    Run Test
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {(test.details || test.issues) && (
              <CardContent className="pt-0">
                {test.details && (
                  <div className="mb-2">
                    <h4 className="font-medium text-green-700 mb-1">✅ Success Details:</h4>
                    <ul className="text-sm text-green-600 list-disc list-inside">
                      {test.details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {test.issues && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-1">❌ Issues Found:</h4>
                    <ul className="text-sm text-red-600 list-disc list-inside">
                      {test.issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Console Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Test Logs</CardTitle>
          <CardDescription>
            Detailed console output from test execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Run tests to see detailed output.</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
          {logs.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setLogs([])}
            >
              Clear Logs
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
