"use client"

import { useRouter } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { AvatarAssistant } from "@/components/avatar-assistant"
import { ViewPotentialScreen } from "@/components/view-potential-screen"
import { useEffect, useState } from "react"

export default function SnapshotPage() {
  const router = useRouter()
  const [businessProposalData, setBusinessProposalData] = useState<any>(null)
  const [panelCount, setPanelCount] = useState<number>(0)
  const [panelWattage, setPanelWattage] = useState<number>(0.44)
  const [annualSavings, setAnnualSavings] = useState<number>(0)
  const [treesEquivalent, setTreesEquivalent] = useState<number>(0)
  const [annualGeneration, setAnnualGeneration] = useState<number>(0)
  const [coveragePercentage, setCoveragePercentage] = useState<number>(0)
  const [systemSizeKw, setSystemSizeKw] = useState<number>(0)
  const [averageConsumption, setAverageConsumption] = useState<number>(4200)

  // Function to calculate annual savings
  const calculateAnnualSavings = (annualGeneration: number): number => {
    const gridRate = 0.35
    const exportRate = 0.2

    const selfConsumption = annualGeneration * 0.3 * gridRate
    const exportRevenue = annualGeneration * 0.7 * exportRate

    

    return Math.round(selfConsumption + exportRevenue)
  }

  // Calculate KPI values
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const businessProposal = localStorage.getItem("business_proposal")
    const personaliseAnswers = localStorage.getItem("personalise_answers")

    if (businessProposal) {
      const parsedBusinessProposal = JSON.parse(businessProposal)
      setBusinessProposalData(parsedBusinessProposal)
      
      // Set panel wattage from environment variable
      const panelWattageValue = parseFloat(process.env.NEXT_PUBLIC_PANEL_WATTAGE || '0.44')
      setPanelWattage(panelWattageValue)
      
      // Calculate system size in panels using the panel wattage
      const systemSizeKwValue = parseFloat((parseFloat(parsedBusinessProposal?.system_size || '0')).toFixed(1))
      
      const panelCountNum = Math.round(systemSizeKwValue / panelWattageValue)
      setPanelCount(panelCountNum)
      setSystemSizeKw(parseFloat((panelCountNum * panelWattageValue).toFixed(1))) // Convert to kW
      
      // Calculate trees equivalent from CO2 savings
      const trees = parseFloat(parsedBusinessProposal?.trees_planted || '0')
      setTreesEquivalent(trees)
      
      // Calculate annual generation from monthly forecast
      const annualGen = parsedBusinessProposal?.monthly_forecast?.reduce(
        (total: number, forecast: any) => total + (forecast?.monthly_sum || 0), 0
      ) || 0
      setAnnualGeneration(Math.round(annualGen))
      
      // Calculate annual savings using custom function
      const calculatedSavings = calculateAnnualSavings(annualGen)
      setAnnualSavings(calculatedSavings)
      
      // Calculate coverage percentage using dynamic average consumption
      let averageConsumptionValue = 4200 // Default fallback value
      if (personaliseAnswers) {
        const parsedPersonaliseAnswers = JSON.parse(personaliseAnswers)
        const billAmount = parseFloat(parsedPersonaliseAnswers?.billAmount || '0')
        if (billAmount > 0) {
          const annual_bill = billAmount * 12
          averageConsumptionValue = annual_bill / 0.35
        }
      }
      setAverageConsumption(Math.round(averageConsumptionValue))
      const coverage = annualGen > 0 ? Math.min(Math.round((annualGen / averageConsumptionValue) * 100), 100) : 0
      setCoveragePercentage(coverage)
    }
  }, [])

  const handleContinue = () => {
    router.push("/personalise")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader maxWidth="max-w-4xl" />
      <ViewPotentialScreen
        panelCount={panelCount}
        annualSolarKwh={annualGeneration}
        energyOffset={coveragePercentage}
        annualSavings={annualSavings}
        treesSaved={treesEquivalent}
        systemSizeKw={systemSizeKw}
        annualHomeKwh={averageConsumption} // Dynamic annual home consumption
        onContinue={handleContinue}
      />
      <AvatarAssistant step={1} pageType="snapshot" />
    </div>
  )
}
