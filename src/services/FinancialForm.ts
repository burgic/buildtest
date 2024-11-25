import { supabase } from '../lib/supabase';
import type { SectionData, SectionId } from '../types/finacialform.types';

export class FinancialFormService {
  static async saveSection(
    workflowId: string,
    sectionId: SectionId,
    data: SectionData[SectionId]
  ) {
    try {
      // Check for existing response
      const { data: existingResponse } = await supabase
        .from('form_responses')
        .select('id')
        .eq('workflow_id', workflowId)
        .eq('section_id', sectionId)
        .maybeSingle();

      if (existingResponse) {
        // Update existing response
        const { error } = await supabase
          .from('form_responses')
          .update({
            data,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingResponse.id);

        if (error) throw error;
      } else {
        // Create new response
        const { error } = await supabase
          .from('form_responses')
          .insert({
            workflow_id: workflowId,
            section_id: sectionId,
            data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving form section:', error);
      throw error;
    }
  }

  static async getResponses(workflowId: string) {
    try {
      const { data, error } = await supabase
        .from('form_responses')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert array of responses to section data map
      return (data || []).reduce((acc, response) => {
        acc[response.section_id as SectionId] = response.data;
        return acc;
      }, {} as Partial<SectionData>);
    } catch (error) {
      console.error('Error fetching form responses:', error);
      throw error;
    }
  }
}