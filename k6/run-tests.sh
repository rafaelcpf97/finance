#!/bin/bash

# k6 Test Runner Script
# This script helps run k6 performance tests for both architectures

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if k6 is installed
check_k6() {
    if ! command -v k6 &> /dev/null; then
        print_error "k6 is not installed. Please install k6 first."
        echo "Installation instructions: https://k6.io/docs/getting-started/installation/"
        exit 1
    fi
    print_info "k6 is installed: $(k6 version)"
}

# Function to check if a service is running
check_service() {
    local url=$1
    local name=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        print_info "$name is running at $url"
        return 0
    else
        print_warning "$name is not accessible at $url"
        return 1
    fi
}

# Function to run tests
run_test() {
    local architecture=$1
    local test_type=$2
    local base_url=$3
    
    local test_file="$SCRIPT_DIR/scripts/$architecture/$test_type.js"
    
    if [ ! -f "$test_file" ]; then
        print_error "Test file not found: $test_file"
        exit 1
    fi
    
    print_info "Running $test_type test for $architecture architecture..."
    print_info "Base URL: $base_url"
    echo ""
    
    # Check if Prometheus remote write URL is set
    if [ -n "$K6_PROMETHEUS_RW_SERVER_URL" ]; then
        print_info "Exporting metrics to Prometheus: $K6_PROMETHEUS_RW_SERVER_URL"
        BASE_URL="$base_url" k6 run --out experimental-prometheus-rw="$K6_PROMETHEUS_RW_SERVER_URL" "$test_file"
    else
        BASE_URL="$base_url" k6 run "$test_file"
    fi
}

# Main script
main() {
    check_k6
    echo ""
    
    # Parse arguments
    if [ $# -lt 2 ]; then
        echo "Usage: $0 <architecture> <test_type> [base_url]"
        echo ""
        echo "Architectures:"
        echo "  monolith      - Test monolith architecture (default: http://localhost:3000)"
        echo "  microservices - Test microservices architecture (default: http://localhost:8000)"
        echo ""
        echo "Test types:"
        echo "  smoke   - Light load test (1 user, 30 seconds)"
        echo "  load    - Normal load test (10 users, 1 minute)"
        echo "  stress  - High load test (50 users, 2 minutes)"
        echo "  spike   - Spike test (sudden load spikes)"
        echo ""
        echo "Examples:"
        echo "  $0 monolith smoke"
        echo "  $0 microservices load"
        echo "  $0 monolith stress http://localhost:3000"
        exit 1
    fi
    
    ARCHITECTURE=$1
    TEST_TYPE=$2
    BASE_URL=${3:-}
    
    # Set default base URLs
    if [ -z "$BASE_URL" ]; then
        if [ "$ARCHITECTURE" == "monolith" ]; then
            BASE_URL="http://localhost:3000"
        elif [ "$ARCHITECTURE" == "microservices" ]; then
            BASE_URL="http://localhost:8000"
        else
            print_error "Unknown architecture: $ARCHITECTURE"
            exit 1
        fi
    fi
    
    # Validate architecture
    if [ "$ARCHITECTURE" != "monolith" ] && [ "$ARCHITECTURE" != "microservices" ]; then
        print_error "Invalid architecture: $ARCHITECTURE"
        echo "Valid options: monolith, microservices"
        exit 1
    fi
    
    # Validate test type
    if [ "$TEST_TYPE" != "smoke" ] && [ "$TEST_TYPE" != "load" ] && [ "$TEST_TYPE" != "stress" ] && [ "$TEST_TYPE" != "spike" ]; then
        print_error "Invalid test type: $TEST_TYPE"
        echo "Valid options: smoke, load, stress, spike"
        exit 1
    fi
    
    # Check if service is running (optional check)
    if [ "$ARCHITECTURE" == "microservices" ]; then
        check_service "$BASE_URL/health" "Microservices API Gateway" || print_warning "Service may not be running. Tests may fail."
    else
        # For monolith, try to check a simple endpoint
        check_service "$BASE_URL/api/users" "Monolith API" || print_warning "Service may not be running. Tests may fail."
    fi
    
    echo ""
    run_test "$ARCHITECTURE" "$TEST_TYPE" "$BASE_URL"
}

main "$@"
