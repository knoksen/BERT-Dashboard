

import React from 'react';
import { TravelBERTStep, Itinerary } from '../types';
import DestinationView from './DestinationView';
import TravelConciergeView from './TravelConciergeView';
import Stepper from './shared/Stepper';
import { RestartIcon, GlobeIcon, ChatBubbleIcon } from './shared/IconComponents';
import usePersistentState from '../hooks/usePersistentState';
import ProcessingView from './shared/ProcessingView';
import { TRIP_BOOKING_STEPS } from '../constants';

const STEPS = [
  { id: 'DESTINATION', name: 'Plan Trip', icon: GlobeIcon },
  { id: 'BOOKING', name: 'Simulate Booking', icon: GlobeIcon },
  { id: 'CONCIERGE', name: 'AI Concierge', icon: ChatBubbleIcon },
];

const TravelBertPlanner: React.FC = () => {
    const [step, setStep, resetStep] = usePersistentState<TravelBERTStep>('travelbert_step', 'DESTINATION');
    const [itinerary, setItinerary, resetItinerary] = usePersistentState<Itinerary | null>('travelbert_itinerary', null);

    const handleItineraryGenerated = (plan: Itinerary) => {
        setItinerary(plan);
        setStep('BOOKING');
    };

    const handleBookingComplete = () => {
        setStep('CONCIERGE');
    };

    const handleReset = () => {
        resetStep();
        resetItinerary();
    };

    const renderStep = () => {
        switch (step) {
            case 'DESTINATION':
                return <DestinationView onItineraryGenerated={handleItineraryGenerated} />;
            case 'BOOKING':
                return (
                     <ProcessingView
                        title="Step 2: Simulating Trip Booking"
                        description="Simulating checking flights, hotels, and activities."
                        icon={GlobeIcon}
                        processingSteps={TRIP_BOOKING_STEPS}
                        onComplete={handleBookingComplete}
                        startButtonText="Start Booking"
                        processingButtonText="Booking..."
                        completeButtonText="Start Concierge Chat"
                        autoStart={true}
                    />
                );
            case 'CONCIERGE':
                return itinerary ? <TravelConciergeView itinerary={itinerary} /> : <p>Error: Itinerary data is missing.</p>;
            default:
                return <DestinationView onItineraryGenerated={handleItineraryGenerated} />;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-full relative px-4">
                 <Stepper steps={STEPS} currentStepId={step} />
                 {step !== 'DESTINATION' && (
                    <button
                        onClick={handleReset}
                        title="Start Over"
                        className="absolute top-0 right-4 p-2 text-dark-text-secondary hover:text-accent transition-colors duration-200"
                        aria-label="Start Over"
                    >
                        <RestartIcon className="w-6 h-6" />
                    </button>
                 )}
            </div>
            {renderStep()}
        </div>
    );
};

export default TravelBertPlanner;