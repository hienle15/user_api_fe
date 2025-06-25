import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, updateUser } from './userSlice';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toastSuccess, toastError } from '../hooks/toast-utils';

const UserForm = ({ user, isEditing = false, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.users);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age?.toString() || '',
  });

  useEffect(() => {
    if (isEditing && user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        age: user.age?.toString() || '',
      });
    }
  }, [isEditing, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing && user?.id) {
        const result = await dispatch(updateUser({
          id: user.id,
          userData: form
        })).unwrap();

        if (result.status === 200) {
          toastSuccess("Success!", result.message);
          if (onSuccess) onSuccess();
        }
      } else {
        const result = await dispatch(createUser(form)).unwrap();
        if (result.status === 201) {
          toastSuccess("Success!", result.message);
          setForm({ name: '', email: '', age: '' });
          if (onSuccess) onSuccess();
        }
      }
    } catch (err) {
      const errorMessage = err.message || err.error;
      toastError("Error!", errorMessage);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-6 space-y-6 bg-transparent shadow-none rounded-xl"
    >
      <h2 className="text-xl font-bold text-center text-gray-700">
        {isEditing ? "Edit User" : "Create New User"}

      </h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">
          Name
          </label>
          <Input
            name="name"
            id="name"
            placeholder="Enter name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
            Email
          </label>
          <Input
            name="email"
            id="email"
            type="email"
            placeholder="Enter email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-600 mb-1">
          Age
          </label>
          <Input
            name="age"
            id="age"
            type="number"
            placeholder="Enter age"
            value={form.age}
            onChange={handleChange}
            required
            className="w-full"
          />
        </div>
      </div>

      <div className="flex  sm:flex-row justify-end gap-3 pt-4">
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className={`w-full sm:w-auto px-6 text-white font-semibold tracking-wide ${isEditing
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
            }`}
        >
          {loading
            ? isEditing
              ? "Saving..."
              : "Creating..."
            : isEditing
              ? "Save Changes"
              : "Create User"}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;