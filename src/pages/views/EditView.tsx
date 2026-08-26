import { useParams } from 'react-router-dom';
import ViewForm from '../../components/ViewForm';

export const EditView = () => {
  const { id } = useParams<{ id: string }>();

  return <ViewForm mode="edit" viewId={id} />;
};

export default EditView;
